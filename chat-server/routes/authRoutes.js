import express from "express";
import jwt from "jsonwebtoken";
import db from "../config/db.js";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();
const SECRET_KEY = "thisIsATestChatApp";
const SALT_ROUNDS = 10;

router.post("/login", (req, res) => {
    const { username, password } = req.body;
    db.all(
        `SELECT * FROM users WHERE username = ?`,
        [username],
        async (err, rows) => {
            if (err) return res.status(500).json({ message: "Internal Server Error" });

            if (rows.length === 0)
                return res.status(404).json({ message: "Username notFound" });

            const isMatch = await bcrypt.compare(password, rows[0].password);

            if(!isMatch){
                return res.status(401).json({ message: "Invalid credentials" });
            }
            else {
                const token = jwt.sign(
                    { username, id: rows[0].id, profileImage: rows[0].profileImage , name: rows[0].name },
                    SECRET_KEY,
                    { expiresIn: "24h" }
                );

                res.status(200).json({ message: "Authentication successful", token });
            }

        }
    );
});

router.get("/me", (req, res) => {
    const { authorization } = req.headers;
    try {
        const decoded = jwt.verify(authorization, SECRET_KEY);
        res.status(200).json({
            message: "Authorization successful",
            username: decoded.username,
            id: decoded.id,
            name: decoded.name,
            profileImage: decoded.profileImage,
        });
    } catch (err) {
        res.status(401).json({ message: "Invalid token" });
    }
});

// Configure multer for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/profileImages/';
        // Create uploads directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Use unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
        return cb(null, true);
    }
    cb(new Error('Only images (jpeg, jpg, png, gif) are allowed'));
};

// Initialize multer with configuration
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});

// Register route with multer middleware
router.post("/register", upload.single('profileImage'), async (req, res) => {
    const { name, username, password } = req.body;

    // Validate required fields
    if (!name || !username || !password) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        // Check if user already exists
        db.all(`SELECT * FROM users WHERE username = ?`, [username], async (err, rows) => {
            if (err) {
                return res.status(500).json({ message: "Internal Server Error" });
            }

            if (rows.length > 0) {
                return res.status(400).json({ message: "User Existed" });
            }

            const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

            // Prepare user data
            const profileImagePath = req.file ? req.file.filename : null;

            // Insert user into database
            db.run(
                `INSERT INTO users (name, username, password, profileImage) VALUES (?, ?, ?, ?)`,
                [name, username, hashedPassword, profileImagePath],
                (err) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ message: "Internal Server Error" });
                    }

                    res.status(201).json({
                        message: "User Created",
                        profileImagePath: profileImagePath
                    });
                }
            );
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default router;
