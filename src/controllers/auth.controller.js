import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { uploadImage, deleteImage } from '../config/cloudinary.js';
import { generateToken } from '../utils/generateToken.js';

// Register
export const register = async (req, res, next) => {
    try {
        const { name, email, password, role, city, area } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'customer',
            city,
            area,
        });

        // Generate token
        const token = generateToken(user._id, user.role);

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                city: user.city,
                area: user.area,
                isAvailable: user.isAvailable,
                isApproved: user.isApproved,
            },
        });
    } catch (err) {
        next(err);
    }
};

// Login
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res
                .status(400)
                .json({ message: 'Please provide email and password' });
        }

        // Find user (include password field)
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate token
        const token = generateToken(user._id, user.role);

        res.status(200).json({
            message: 'Logged in successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                city: user.city,
                area: user.area,
                isAvailable: user.isAvailable,
                isApproved: user.isApproved,
            },
        });
    } catch (err) {
        next(err);
    }
};

// Logout
export const logout = async (req, res, next) => {
    try {
        // In a JWT-based system, logout is typically handled on the client by removing the token.
        // This endpoint serves as a confirmation endpoint and can be extended with token blacklisting.
        res.status(200).json({
            message: 'Logged out successfully',
        });
    } catch (err) {
        next(err);
    }
};

// Upload/Update profile image
export const uploadProfileImage = async (req, res, next) => {
    try {
        const userId = req.params.userId || req.user.id;

        if (req.user.id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized to upload profile image for this user' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        // Delete old image from Cloudinary if exists
        if (user.profileImage?.url) {
            const publicId = user.profileImage.url.split('/').pop().split('.')[0];
            try {
                await deleteImage(`profiles/${publicId}`);
            } catch (err) {
                console.error('Error deleting old image:', err);
            }
        }

        // Upload new image to Cloudinary
        const uploadResult = await uploadImage(req.file.buffer, 'profiles');

        // Update user with new profile image
        user.profileImage = {
            url: uploadResult.url,
            uploadedAt: new Date(),
        };

        await user.save();

        res.status(200).json({
            message: 'Profile image uploaded successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage,
            },
        });
    } catch (err) {
        next(err);
    }
};

// Update user profile
export const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { name, city, area, currentPassword, newPassword } = req.body;

        const user = await User.findById(userId).select('+password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update basic fields if provided
        if (name) user.name = name.trim();
        if (city) user.city = city.trim();
        if (area) user.area = area.trim();

        // Handle password change
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ message: 'Current password is required to change password' });
            }

            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Current password is incorrect' });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({ message: 'New password must be at least 6 characters' });
            }

            user.password = await bcrypt.hash(newPassword, 10);
        }

        await user.save();

        res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                city: user.city,
                area: user.area,
                isApproved: user.isApproved,
                isAvailable: user.isAvailable,
                profileImage: user.profileImage || null,
            },
        });
    } catch (err) {
        next(err);
    }
};
// Update provider availability status
export const updateAvailability = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { isAvailable } = req.body;

        if (typeof isAvailable !== 'boolean') {
            return res.status(400).json({ message: 'isAvailable must be a boolean' });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { isAvailable },
            { new: true, select: '-password' }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'Availability updated successfully',
            isAvailable: user.isAvailable,
            user,
        });
    } catch (err) {
        next(err);
    }
};