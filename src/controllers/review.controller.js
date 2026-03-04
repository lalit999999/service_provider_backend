import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import { BOOKING_STATUS } from '../constants/bookingStatus.js';

// Create review (customer only, after booking is completed)
export const createReview = async (req, res, next) => {
    try {
        const { bookingId, rating, comment } = req.body;
        const customerId = req.user.id;

        // Validation
        if (!bookingId || !rating || !comment) {
            return res
                .status(400)
                .json({ message: 'Please provide bookingId, rating, and comment' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        // Check if booking exists and is completed
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Only customer of the booking can review
        if (booking.customerId.toString() !== customerId) {
            return res
                .status(403)
                .json({ message: 'Only booking customer can review' });
        }

        // Booking must be completed
        if (booking.status !== BOOKING_STATUS.COMPLETED) {
            return res.status(400).json({
                message: `Booking must be ${BOOKING_STATUS.COMPLETED} to review. Current status: ${booking.status}`,
            });
        }

        // Check if review already exists for this booking
        const existingReview = await Review.findOne({ bookingId });
        if (existingReview) {
            return res.status(400).json({ message: 'Review already exists for this booking' });
        }

        // Create review
        const review = await Review.create({
            bookingId,
            rating,
            comment,
            providerId: booking.providerId,
            customerId,
        });

        // Populate details
        await review.populate([
            { path: 'bookingId', select: '_id dateTime' },
            { path: 'providerId', select: 'name email' },
            { path: 'customerId', select: 'name email' },
        ]);

        res.status(201).json({
            message: 'Review created successfully',
            review,
        });
    } catch (err) {
        next(err);
    }
};

// Get all reviews for a provider (with aggregated average rating)
export const getProviderReviews = async (req, res, next) => {
    try {
        const { providerId } = req.params;

        // Use MongoDB aggregation pipeline to calculate stats
        const aggregationResult = await Review.aggregate([
            {
                $match: { providerId: new (require('mongoose').Types.ObjectId)(providerId) },
            },
            {
                $facet: {
                    stats: [
                        {
                            $group: {
                                _id: null,
                                averageRating: { $avg: '$rating' },
                                totalReviews: { $sum: 1 },
                                minRating: { $min: '$rating' },
                                maxRating: { $max: '$rating' },
                            },
                        },
                        {
                            $project: {
                                _id: 0,
                                averageRating: { $round: ['$averageRating', 1] },
                                totalReviews: 1,
                                minRating: 1,
                                maxRating: 1,
                            },
                        },
                    ],
                    reviews: [
                        {
                            $sort: { createdAt: -1 },
                        },
                        {
                            $lookup: {
                                from: 'bookings',
                                localField: 'bookingId',
                                foreignField: '_id',
                                as: 'booking',
                            },
                        },
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'customerId',
                                foreignField: '_id',
                                as: 'customer',
                            },
                        },
                        {
                            $project: {
                                _id: 1,
                                bookingId: 1,
                                rating: 1,
                                comment: 1,
                                providerId: 1,
                                customerId: 1,
                                createdAt: 1,
                                updatedAt: 1,
                                'booking._id': 1,
                                'booking.dateTime': 1,
                                'customer.name': 1,
                                'customer.email': 1,
                                'customer.city': 1,
                                'customer.area': 1,
                            },
                        },
                    ],
                },
            },
        ]);

        const stats = aggregationResult[0]?.stats[0] || {
            averageRating: 0,
            totalReviews: 0,
            minRating: null,
            maxRating: null,
        };
        const reviews = aggregationResult[0]?.reviews || [];

        res.status(200).json({
            message: 'Reviews retrieved successfully',
            count: stats.totalReviews,
            averageRating: stats.averageRating,
            minRating: stats.minRating,
            maxRating: stats.maxRating,
            totalReviews: stats.totalReviews,
            reviews,
        });
    } catch (err) {
        next(err);
    }
};

// Get review for a booking
export const getBookingReview = async (req, res, next) => {
    try {
        const { bookingId } = req.params;

        const review = await Review.findOne({ bookingId }).populate([
            { path: 'bookingId', select: '_id dateTime' },
            { path: 'providerId', select: 'name email' },
            { path: 'customerId', select: 'name email' },
        ]);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        res.status(200).json({
            message: 'Review retrieved successfully',
            review,
        });
    } catch (err) {
        next(err);
    }
};

// Update review (customer only)
export const updateReview = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const customerId = req.user.id;

        // Validation
        if (!rating && !comment) {
            return res
                .status(400)
                .json({ message: 'Please provide at least rating or comment' });
        }

        if (rating && (rating < 1 || rating > 5)) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Only customer who wrote the review can update it
        if (review.customerId.toString() !== customerId) {
            return res
                .status(403)
                .json({ message: 'Only review author can update it' });
        }

        // Update fields
        if (rating) review.rating = rating;
        if (comment) review.comment = comment;

        await review.save();

        await review.populate([
            { path: 'bookingId', select: '_id dateTime' },
            { path: 'providerId', select: 'name email' },
            { path: 'customerId', select: 'name email' },
        ]);

        res.status(200).json({
            message: 'Review updated successfully',
            review,
        });
    } catch (err) {
        next(err);
    }
};

// Delete review (customer only)
export const deleteReview = async (req, res, next) => {
    try {
        const { id } = req.params;
        const customerId = req.user.id;

        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Only customer who wrote the review can delete it
        if (review.customerId.toString() !== customerId) {
            return res
                .status(403)
                .json({ message: 'Only review author can delete it' });
        }

        await Review.findByIdAndDelete(id);

        res.status(200).json({
            message: 'Review deleted successfully',
        });
    } catch (err) {
        next(err);
    }
};
