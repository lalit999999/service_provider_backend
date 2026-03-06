import express from 'express';
import { healthCheck } from '../controllers/health.controller.js';

const router = express.Router();

// Health check endpoint - no auth required
router.get('/', healthCheck);

export default router;
