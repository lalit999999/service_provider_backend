import express from 'express';
import { getDashboardStats, getAllUsers, getAllBookings } from '../controllers/admin.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';

const router = express.Router();

// Middleware chain: auth + admin role check
const adminAuth = [authMiddleware, roleMiddleware(['admin'])];

// Dashboard stats with optional date filtering
router.get('/stats', ...adminAuth, getDashboardStats);

// User management: list with filtering
router.get('/users', ...adminAuth, getAllUsers);

// Booking overview: list with filtering
router.get('/bookings', ...adminAuth, getAllBookings);

export default router;
