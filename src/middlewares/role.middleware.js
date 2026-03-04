export const roleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        // Check if user is authenticated (authMiddleware should have run first)
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        // Check if user's role is in allowed roles
        if (!allowedRoles.includes(req.user.role)) {
            return res
                .status(403)
                .json({
                    message: `Access denied. Only ${allowedRoles.join(', ')} can access this`,
                });
        }

        next();
    };
};
