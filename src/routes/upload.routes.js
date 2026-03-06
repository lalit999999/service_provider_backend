import express from 'express';
import { uploadFileController } from '../controllers/upload.controller.js';
import { uploadSingle } from '../middlewares/upload.middleware.js';

const router = express.Router();

// POST /api/upload - Upload a file
router.post('/', uploadSingle, uploadFileController);

export default router;
