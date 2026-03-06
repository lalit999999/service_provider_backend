import { uploadImage } from '../config/cloudinary.js';

export const uploadFileController = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file provided' });
        }

        // Upload file to Cloudinary
        const result = await uploadImage(req.file.buffer, 'bookings');

        res.status(200).json({
            message: 'File uploaded successfully',
            url: result.url,
            publicId: result.publicId
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            message: 'Failed to upload file',
            error: error.message
        });
    }
};
