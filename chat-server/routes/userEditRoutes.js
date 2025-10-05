import express from "express";
import db from "../config/db.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";

const router = express.Router();
const SALT_ROUNDS = 10;
const SECRET_KEY = "thisIsATestChatApp";

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
router.put("/users/editProfile", upload.single('profileImage'), async (req, res) => {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, SECRET_KEY);
    const userId = decoded.id
    const {name} = req.body

    try {
        // Prepare user data
        const profileImagePath = req.file ? req.file.path : decoded.profileImage;

        // update database
        db.run("UPDATE users SET profileImage = ? AND name = ? WHERE id = ?", [profileImagePath, name, userId], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "User updated successfully", profileImage: profileImagePath , name: name });
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default router;
