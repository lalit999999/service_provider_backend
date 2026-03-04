import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a category name'],
            unique: true,
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Please provide a description'],
        },
    },
    { timestamps: true }
);

export default mongoose.model('Category', categorySchema);
