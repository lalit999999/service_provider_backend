import { uploadImage } from '../config/cloudinary.js';

export const uploadFileController = async (req, res) => {
    try {
        console.log('Upload request received:', {
            hasFile: !!req.file,
            fileName: req.file?.originalname,
            fileSize: req.file?.size,
            fileMime: req.file?.mimetype
        });

        if (!req.file) {
            return res.status(400).json({ message: 'No file provided' });
        }

        // Upload file to Cloudinary
        console.log('Uploading to Cloudinary...');
        const result = await uploadImage(req.file.buffer, 'bookings');
        console.log('Upload successful:', result);

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
