import express from 'express';
import { register, login, logout, uploadProfileImage } from '../controllers/auth.controller.js';
import { uploadSingle } from '../middlewares/upload.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/profile-image', authMiddleware, uploadSingle, uploadProfileImage);
router.put('/:userId/profile-image', authMiddleware, uploadSingle, uploadProfileImage);

export default router;
