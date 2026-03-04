import express from 'express';
import {
    createBooking,
    getBookings,
    getBookingById,
    updateBookingStatus,
    cancelBooking,
} from '../controllers/booking.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';

const router = express.Router();

// Protected routes (auth required)
router.post('/', authMiddleware, roleMiddleware(['customer']), createBooking);
router.get('/', authMiddleware, getBookings);
router.get('/:id', authMiddleware, getBookingById);

// Provider routes (update status)
router.put(
    '/:id/status',
    authMiddleware,
    roleMiddleware(['provider']),
    updateBookingStatus
);

// Cancel booking (customer or provider)
router.put('/:id/cancel', authMiddleware, cancelBooking);

export default router;
