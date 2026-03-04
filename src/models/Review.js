import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
    {
        bookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking',
            required: [true, 'Please provide booking ID'],
            unique: true, // One review per booking
        },
        rating: {
            type: Number,
            required: [true, 'Please provide a rating'],
            min: [1, 'Rating must be at least 1'],
            max: [5, 'Rating cannot exceed 5'],
        },
        comment: {
            type: String,
            required: [true, 'Please provide a comment'],
            trim: true,
            minlength: [10, 'Comment must be at least 10 characters'],
            maxlength: [500, 'Comment cannot exceed 500 characters'],
        },
        providerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Please provide provider ID'],
        },
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Please provide customer ID'],
        },
    },
    { timestamps: true }
);

export default mongoose.model('Review', reviewSchema);
