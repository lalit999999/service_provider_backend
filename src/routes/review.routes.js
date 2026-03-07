import express from 'express';
import {
    createReview,
    getProviderReviews,
    getServiceReviews,
    getBookingReview,
    updateReview,
    deleteReview,
} from '../controllers/review.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';

const router = express.Router();

// Public routes
router.get('/provider/:providerId', getProviderReviews);
router.get('/service/:serviceId', getServiceReviews);
router.get('/booking/:bookingId', getBookingReview);

// Customer routes
router.post('/', authMiddleware, roleMiddleware(['customer']), createReview);
router.put('/:id', authMiddleware, roleMiddleware(['customer']), updateReview);
router.delete('/:id', authMiddleware, roleMiddleware(['customer']), deleteReview);

export default router;
