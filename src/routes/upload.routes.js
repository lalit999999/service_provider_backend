import express from 'express';
import { uploadFileController } from '../controllers/upload.controller.js';
import { uploadSingle } from '../middlewares/upload.middleware.js';

const router = express.Router();

// POST /api/upload - Upload a file
// Use uploadSingle middleware with error handling
router.post('/', (req, res, next) => {
    uploadSingle(req, res, (err) => {
        if (err) {
            console.error('Multer error:', err);
            return res.status(400).json({
                message: 'File upload failed',
                error: err.message
            });
        }
        // If no error, move to the controller
        next();
    });
}, uploadFileController);

export default router;
