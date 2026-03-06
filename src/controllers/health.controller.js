// Health check endpoint
export const healthCheck = async (req, res, next) => {
    try {
        res.status(200).json({
            message: 'Server is healthy',
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        });
    } catch (err) {
        next(err);
    }
};
