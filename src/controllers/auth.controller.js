import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { uploadImage, deleteImage } from '../config/cloudinary.js';
import { generateToken } from '../utils/generateToken.js';
import { sendResetPasswordEmail, sendWelcomeEmail } from '../config/email.js';
import { isValidObjectId } from '../utils/validateObjectId.js';

// Register
export const register = async (req, res, next) => {
    try {
        let { name, email, password, role, city, area } = req.body;

        // Normalize email
        email = email ? email.trim().toLowerCase() : '';

        // Check if user exists - use case-insensitive regex query
        const existingUser = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });
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

        try {
            // Send welcome email
            await sendWelcomeEmail(email, name);
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
            // Continue even if email fails - user account is created
        }

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
                profileImage: user.profileImage || null,
            },
        });
    } catch (err) {
        next(err);
    }
};

// Login
export const login = async (req, res, next) => {
    try {
        let { email, password } = req.body;

        // Validation
        if (!email || !email.trim() || !password) {
            return res
                .status(400)
                .json({ message: 'Please provide email and password' });
        }

        // Normalize email
        email = email.trim().toLowerCase();

        // Find user (include password field) - use case-insensitive regex query
        const user = await User.findOne({ email: new RegExp(`^${email}$`, 'i') }).select('+password');
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
                profileImage: user.profileImage || null,
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

        // Validate ObjectId
        if (req.params.userId && !isValidObjectId(userId)) {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }

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
            url: uploadResult.url,
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

// Forgot Password
export const forgotPassword = async (req, res, next) => {
    try {
        let { email } = req.body;

        if (!email || !email.trim()) {
            return res.status(400).json({ message: 'Please provide an email address' });
        }

        // Normalize email
        email = email.trim().toLowerCase();

        // Use case-insensitive regex query to handle any case variations
        const user = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });
        if (!user) {
            // Don't reveal if email exists or not for security
            return res.status(200).json({
                message: 'If an account with this email exists, you will receive a password reset code via email. Please check your inbox and spam folder.'
            });
        }

        // Generate a simple reset token (4-digit code)
        const resetToken = Math.floor(1000 + Math.random() * 9000).toString();
        const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Store reset token and expiry
        user.resetToken = resetToken;
        user.resetTokenExpiry = resetTokenExpiry;
        await user.save();

        try {
            // Send password reset email
            await sendResetPasswordEmail(email, resetToken, user.name);
        } catch (emailError) {
            console.error('Failed to send reset email:', emailError);
            // Still return success even if email fails to maintain security
            // but log the issue for debugging
        }

        res.status(200).json({
            message: 'If an account with this email exists, you will receive a password reset code via email. Please check your inbox and spam folder.'
        });
    } catch (err) {
        next(err);
    }
};

// Reset Password
export const resetPassword = async (req, res, next) => {
    try {
        const { email, resetToken, newPassword } = req.body;

        // Validate all required fields
        if (!email || !email.trim()) {
            return res.status(400).json({
                message: 'Email is required'
            });
        }

        if (!resetToken || !resetToken.toString().trim()) {
            return res.status(400).json({
                message: 'Reset code is required'
            });
        }

        if (!newPassword || !newPassword.trim()) {
            return res.status(400).json({
                message: 'New password is required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                message: 'Password must be at least 6 characters'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        // Use case-insensitive regex query to be absolutely sure
        const user = await User.findOne({ email: new RegExp(`^${normalizedEmail}$`, 'i') });
        if (!user || !user.resetToken) {
            return res.status(400).json({
                message: 'Invalid email or reset code - no reset request found'
            });
        }

        // Check if reset token matches and hasn't expired
        // Convert both to string for comparison, trim the incoming token
        const incomingToken = resetToken.toString().trim();
        if (user.resetToken !== incomingToken) {
            return res.status(400).json({
                message: 'Invalid reset code - code does not match'
            });
        }

        if (new Date() > user.resetTokenExpiry) {
            user.resetToken = null;
            user.resetTokenExpiry = null;
            await user.save();
            return res.status(400).json({
                message: 'Reset code has expired. Please request a new one.'
            });
        }

        // Update password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetToken = null;
        user.resetTokenExpiry = null;
        await user.save();

        res.status(200).json({
            message: 'Password reset successfully. You can now log in with your new password.'
        });
    } catch (err) {
        next(err);
    }
};