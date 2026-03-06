import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a name'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Please provide an email'],
            unique: true,
            lowercase: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid email',
            ],
        },
        password: {
            type: String,
            required: [true, 'Please provide a password'],
            minlength: 6,
            select: false, // Don't return password by default
        },
        role: {
            type: String,
            enum: ['customer', 'provider', 'admin'],
            default: 'customer',
        },
        city: {
            type: String,
            // required: function () {
            //     return this.role === "customer" || this.role === "provider";
            // }
        },
        area: {
            type: String,
            // required: function () {
            //     return this.role === "customer" || this.role === "provider";
            // }
        },
        isApproved: {
            type: Boolean,
            default: false,
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
        profileImage: {
            url: String,
            uploadedAt: Date,
        },
    },
    { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;