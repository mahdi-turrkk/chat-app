import express from "express";
import jwt from "jsonwebtoken";
import db from "../config/db.js";
import bcrypt from "bcrypt";

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
                    { username, id: rows[0].id },
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
        });
    } catch (err) {
        res.status(401).json({ message: "Invalid token" });
    }
});

router.post("/register",  (req, res) => {
    const { name, username, password } = req.body;

    db.all(`SELECT * FROM users WHERE username = ?`, [username], async (err, rows) => {
        if (err) return res.status(500).json({ message: "Internal Server Error" });

        if (rows.length > 0)
            return res.status(400).json({ message: "User Existed" });

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        db.run(
            `INSERT INTO users (name, username, password) VALUES (?, ?, ?)`,
            [name, username, hashedPassword],
            (err) => {
                console.log(err)
                if (err) return res.status(500).json({ message: "Internal Server Error" });
                res.status(201).json({ message: "User Created" });
            }
        );
    });
});

export default router;
