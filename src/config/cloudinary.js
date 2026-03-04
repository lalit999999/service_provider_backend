import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload image to Cloudinary
 * @param {Buffer} fileBuffer - Image file buffer from multer
 * @param {string} folder - Cloudinary folder path (e.g., 'profiles', 'bookings')
 * @returns {Promise<{url: string, publicId: string}>} - Cloudinary URL and public ID
 */
export const uploadImage = async (fileBuffer, folder = 'service-provider') => {
    try {
        return new Promise((resolve, reject) => {
            const upload = cloudinary.uploader.upload_stream(
                { folder, resource_type: 'auto' },
                (error, result) => {
                    if (error) reject(error);
                    else resolve({
                        url: result.secure_url,
                        publicId: result.public_id
                    });
                }
            );
            upload.end(fileBuffer);
        });
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error(`Failed to upload image: ${error.message}`);
    }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Image public ID from Cloudinary
 * @returns {Promise<void>}
 */
export const deleteImage = async (publicId) => {
    try {
        if (!publicId) return;
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        throw new Error(`Failed to delete image: ${error.message}`);
    }
};

export default cloudinary;
