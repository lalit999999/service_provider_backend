import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
    {
        providerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Please provide provider ID'],
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'Please provide category ID'],
        },
        title: {
            type: String,
            required: [true, 'Please provide service title'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Please provide service description'],
        },
        basePrice: {
            type: Number,
            required: [true, 'Please provide base price'],
            min: [0, 'Price cannot be negative'],
        },
    },
    { timestamps: true }
);

export default mongoose.model('Service', serviceSchema);
