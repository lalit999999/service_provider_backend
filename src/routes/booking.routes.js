import express from 'express';
import {
    createBooking,
    getBookings,
    getBookingById,
    acceptBooking,
    updateBookingStatus,
    cancelBooking,
    rescheduleBooking,
    uploadCustomerImage,
    uploadProviderWorkImage,
    addNotes,
} from '../controllers/booking.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';
import { uploadSingle } from '../middlewares/upload.middleware.js';

const router = express.Router();

// Protected routes (auth required)
router.post('/', authMiddleware, roleMiddleware(['customer']), createBooking);
router.get('/', authMiddleware, getBookings);
router.get('/:id', authMiddleware, getBookingById);

// Provider routes
router.patch(
    '/:id/accept',
    authMiddleware,
    roleMiddleware(['provider']),
    acceptBooking
);
router.patch(
    '/:id/status',
    authMiddleware,
    roleMiddleware(['provider']),
    updateBookingStatus
);

// Cancel booking (customer or provider)
router.patch('/:id/cancel', authMiddleware, cancelBooking);

// Reschedule booking (customer only)
router.patch('/:id/reschedule', authMiddleware, roleMiddleware(['customer']), rescheduleBooking);

// Add notes (provider only)
router.patch('/:id/notes', authMiddleware, roleMiddleware(['provider']), addNotes);

// Image upload routes
router.post('/:bookingId/issue-image', authMiddleware, uploadSingle, uploadCustomerImage);
router.post('/:bookingId/work-image', authMiddleware, uploadSingle, uploadProviderWorkImage);

export default router;
