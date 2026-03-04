import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
    {
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Please provide customer ID'],
        },
        providerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Please provide provider ID'],
        },
        serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service',
            required: [true, 'Please provide service ID'],
        },
        address: {
            type: String,
            required: [true, 'Please provide service address'],
        },
        dateTime: {
            type: Date,
            required: [true, 'Please provide booking date and time'],
        },
        notes: {
            type: String,
            default: '',
        },
        priceAtBooking: {
            type: Number,
            required: [true, 'Please provide price at booking'],
            min: [0, 'Price cannot be negative'],
        },
        status: {
            type: String,
            enum: ['Requested', 'Accepted', 'Rejected', 'Completed', 'Cancelled'],
            default: 'Requested',
        },
    },
    { timestamps: true }
);

export default mongoose.model('Booking', bookingSchema);
