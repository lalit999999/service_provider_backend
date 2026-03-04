import Review from '../models/Review.js';
import mongoose from 'mongoose';

/**
 * Get provider rating stats using MongoDB aggregation
 * @param {string} providerId - Provider ID
 * @returns {Object} Stats including averageRating, totalReviews, minRating, maxRating
 */
export const getProviderRatingStats = async (providerId) => {
    try {
        const stats = await Review.aggregate([
            {
                $match: {
                    providerId: new mongoose.Types.ObjectId(providerId),
                },
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 },
                    minRating: { $min: '$rating' },
                    maxRating: { $max: '$rating' },
                    ratingDistribution: {
                        $push: '$rating',
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    averageRating: { $round: ['$averageRating', 2] },
                    totalReviews: 1,
                    minRating: 1,
                    maxRating: 1,
                    ratingDistribution: {
                        $reduce: {
                            input: ['$ratingDistribution'],
                            initialValue: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
                            in: {
                                $mergeObjects: [
                                    '$$value',
                                    {
                                        $cond: [
                                            { $eq: ['$$this', 5] },
                                            { 5: { $add: [{ $ifNull: ['$$value.5', 0] }, 1] } },
                                            {
                                                $cond: [
                                                    { $eq: ['$$this', 4] },
                                                    { 4: { $add: [{ $ifNull: ['$$value.4', 0] }, 1] } },
                                                    {
                                                        $cond: [
                                                            { $eq: ['$$this', 3] },
                                                            { 3: { $add: [{ $ifNull: ['$$value.3', 0] }, 1] } },
                                                            {
                                                                $cond: [
                                                                    { $eq: ['$$this', 2] },
                                                                    { 2: { $add: [{ $ifNull: ['$$value.2', 0] }, 1] } },
                                                                    { 1: { $add: [{ $ifNull: ['$$value.1', 0] }, 1] } },
                                                                ],
                                                            },
                                                        ],
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            },
                        },
                    },
                },
            },
        ]);

        return (
            stats[0] || {
                averageRating: 0,
                totalReviews: 0,
                minRating: null,
                maxRating: null,
            }
        );
    } catch (err) {
        console.error('Error calculating provider rating stats:', err);
        return {
            averageRating: 0,
            totalReviews: 0,
            minRating: null,
            maxRating: null,
        };
    }
};

/**
 * Get category stats using MongoDB aggregation
 * @param {string} categoryId - Category ID
 * @returns {Object} Stats including total services, average price
 */
export const getCategoryStats = async (categoryId) => {
    try {
        const Service = (await import('../models/Service.js')).default;

        const stats = await Service.aggregate([
            {
                $match: {
                    categoryId: new mongoose.Types.ObjectId(categoryId),
                },
            },
            {
                $group: {
                    _id: null,
                    totalServices: { $sum: 1 },
                    averagePrice: { $avg: '$basePrice' },
                    minPrice: { $min: '$basePrice' },
                    maxPrice: { $max: '$basePrice' },
                },
            },
            {
                $project: {
                    _id: 0,
                    totalServices: 1,
                    averagePrice: { $round: ['$averagePrice', 2] },
                    minPrice: 1,
                    maxPrice: 1,
                },
            },
        ]);

        return (
            stats[0] || {
                totalServices: 0,
                averagePrice: 0,
                minPrice: null,
                maxPrice: null,
            }
        );
    } catch (err) {
        console.error('Error calculating category stats:', err);
        return {
            totalServices: 0,
            averagePrice: 0,
            minPrice: null,
            maxPrice: null,
        };
    }
};
