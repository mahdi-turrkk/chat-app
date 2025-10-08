import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Endpoint to serve profile images
router.get('/files/:filePath', (req, res) => {
    const { filePath } = req.params;
    const { fileType } = req.query
    const file = path.join(__dirname, '..', 'uploads', fileType=='profile' ? 'profileImages': 'MessageFiles', filePath);

    // Check if file exists
    if (!fs.existsSync(file)) {
        return res.status(404).json({ message: 'Image not found' });
    }

    // Serve the image file
    res.sendFile(file, (err) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Error serving image' });
        }
    });
});

export default router;