import User from '../models/User.js';
import Booking from '../models/Booking.js';

// Get dashboard stats with optional date filtering
export const getDashboardStats = async (req, res, next) => {
    try {
        const { dateFrom, dateTo } = req.query;

        // Parse and validate date parameters
        let dateFilter = {};
        if (dateFrom || dateTo) {
            try {
                if (dateFrom) {
                    dateFilter.$gte = new Date(dateFrom);
                }
                if (dateTo) {
                    const endDate = new Date(dateTo);
                    endDate.setHours(23, 59, 59, 999); // Include entire day
                    dateFilter.$lte = endDate;
                }
            } catch (err) {
                return res.status(400).json({ message: 'Invalid date format. Use ISO 8601 (YYYY-MM-DD)' });
            }
        } else {
            // Default: current month from 1st to last day
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            dateFilter.$gte = new Date(currentYear, currentMonth, 1);
            dateFilter.$lte = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);
        }

        // Count users by role
        const totalUsers = await User.countDocuments();
        const totalProviders = await User.countDocuments({ role: 'provider' });
        const totalCustomers = await User.countDocuments({ role: 'customer' });
        const totalAdmins = await User.countDocuments({ role: 'admin' });

        // Count bookings by status within date range
        const totalBookings = await Booking.countDocuments({ createdAt: dateFilter });
        const completedBookings = await Booking.countDocuments({
            status: 'Completed',
            createdAt: dateFilter
        });
        const pendingBookings = await Booking.countDocuments({
            status: { $in: ['Requested', 'Accepted'] },
            createdAt: dateFilter
        });
        const cancelledBookings = await Booking.countDocuments({
            status: 'Cancelled',
            createdAt: dateFilter
        });

        // Calculate total revenue (completed bookings only)
        const revenueResult = await Booking.aggregate([
            {
                $match: {
                    status: 'Completed',
                    createdAt: dateFilter
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$priceAtBooking' }
                }
            }
        ]);

        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        res.status(200).json({
            message: 'Dashboard stats retrieved successfully',
            stats: {
                users: {
                    total: totalUsers,
                    providers: totalProviders,
                    customers: totalCustomers,
                    admins: totalAdmins
                },
                bookings: {
                    total: totalBookings,
                    completed: completedBookings,
                    pending: pendingBookings,
                    cancelled: cancelledBookings
                },
                revenue: {
                    total: parseFloat(totalRevenue.toFixed(2)),
                    currency: 'INR',
                    completedBookingsCount: completedBookings
                },
                dateRange: {
                    from: new Date(dateFilter.$gte).toISOString(),
                    to: new Date(dateFilter.$lte).toISOString()
                }
            }
        });
    } catch (err) {
        next(err);
    }
};

// Approve a provider
export const approveProvider = async (req, res, next) => {
    try {
        const { providerId } = req.params;

        const provider = await User.findById(providerId);

        if (!provider) {
            return res.status(404).json({ message: 'Provider not found' });
        }

        if (provider.role !== 'provider') {
            return res.status(400).json({ message: 'User is not a provider' });
        }

        if (provider.isApproved) {
            return res.status(400).json({ message: 'Provider is already approved' });
        }

        provider.isApproved = true;
        await provider.save();

        res.status(200).json({
            message: 'Provider approved successfully',
            provider: {
                id: provider._id,
                name: provider.name,
                email: provider.email,
                role: provider.role,
                isApproved: provider.isApproved,
                city: provider.city,
                area: provider.area
            }
        });
    } catch (err) {
        next(err);
    }
};

// Reject a provider (set isApproved to false)
export const rejectProvider = async (req, res, next) => {
    try {
        const { providerId } = req.params;

        const provider = await User.findById(providerId);

        if (!provider) {
            return res.status(404).json({ message: 'Provider not found' });
        }

        if (provider.role !== 'provider') {
            return res.status(400).json({ message: 'User is not a provider' });
        }

        if (!provider.isApproved) {
            return res.status(400).json({ message: 'Provider is already not approved' });
        }

        provider.isApproved = false;
        await provider.save();

        res.status(200).json({
            message: 'Provider rejected successfully',
            provider: {
                id: provider._id,
                name: provider.name,
                email: provider.email,
                role: provider.role,
                isApproved: provider.isApproved,
                city: provider.city,
                area: provider.area
            }
        });
    } catch (err) {
        next(err);
    }
};

// Get all users with optional filtering
export const getAllUsers = async (req, res, next) => {
    try {
        const { role, available, city } = req.query;

        // Build dynamic filter object
        let filter = {};

        if (role) {
            filter.role = role;
        }

        if (available !== undefined) {
            filter.isAvailable = available === 'true';
        }

        if (city) {
            filter.city = new RegExp(city, 'i'); // Case-insensitive city search
        }

        // Query users with filters, exclude password
        const users = await User.find(filter)
            .select('-password')
            .sort({ createdAt: -1 }); // Newest first

        res.status(200).json({
            message: 'Users retrieved successfully',
            count: users.length,
            users: users.map(user => ({
                _id: user._id,
                id: user._id.toString(), // For consistency
                name: user.name,
                email: user.email,
                role: user.role,
                city: user.city,
                area: user.area,
                isApproved: user.isApproved,
                isAvailable: user.isAvailable,
                profileImage: user.profileImage || null,
                createdAt: user.createdAt
            }))
        });
    } catch (err) {
        next(err);
    }
};

// Get all bookings with optional filtering
export const getAllBookings = async (req, res, next) => {
    try {
        const { status, dateFrom, dateTo } = req.query;

        // Build date filter
        let dateFilter = {};
        if (dateFrom || dateTo) {
            try {
                if (dateFrom) {
                    dateFilter.$gte = new Date(dateFrom);
                }
                if (dateTo) {
                    const endDate = new Date(dateTo);
                    endDate.setHours(23, 59, 59, 999); // Include entire day
                    dateFilter.$lte = endDate;
                }
            } catch (err) {
                return res.status(400).json({ message: 'Invalid date format. Use ISO 8601 (YYYY-MM-DD)' });
            }
        }

        // Build filter object
        let filter = {};
        if (status) {
            filter.status = status;
        }
        if (Object.keys(dateFilter).length > 0) {
            filter.createdAt = dateFilter;
        }

        // Get bookings with populated references
        const bookings = await Booking.find(filter)
            .populate('customerId', 'name email')
            .populate('providerId', 'name email')
            .populate('serviceId', 'title basePrice')
            .sort({ createdAt: -1 }); // Newest first

        // Transform bookings to include computed fields
        const transformedBookings = bookings.map(booking => ({
            id: booking._id,
            customer: booking.customerId ? {
                id: booking.customerId._id,
                name: booking.customerId.name,
                email: booking.customerId.email
            } : null,
            provider: booking.providerId ? {
                id: booking.providerId._id,
                name: booking.providerId.name,
                email: booking.providerId.email
            } : null,
            service: booking.serviceId ? {
                id: booking.serviceId._id,
                title: booking.serviceId.title,
                basePrice: booking.serviceId.basePrice
            } : null,
            address: booking.address,
            dateTime: booking.dateTime,
            priceAtBooking: booking.priceAtBooking,
            status: booking.status,
            hasCustomerImage: !!booking.customerImage?.url,
            providerImageCount: booking.providerImages?.length || 0,
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt
        }));

        res.status(200).json({
            message: 'Bookings retrieved successfully',
            count: transformedBookings.length,
            bookings: transformedBookings
        });
    } catch (err) {
        next(err);
    }
};
