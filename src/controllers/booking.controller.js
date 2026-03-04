import Booking from '../models/Booking.js';
import { isValidStatusTransition, BOOKING_STATUS } from '../constants/bookingStatus.js';
import User from '../models/User.js';

// Create booking (customer only)
export const createBooking = async (req, res, next) => {
    try {
        const { serviceId, address, dateTime, notes } = req.body;
        const customerId = req.user.id;

        // Validation
        if (!serviceId || !address || !dateTime) {
            return res
                .status(400)
                .json({ message: 'Please provide serviceId, address, and dateTime' });
        }

        // Get service to find provider
        const Service = (await import('../models/Service.js')).default;
        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        const providerId = service.providerId;

        // ✅ Check: Customer is not booking their own service
        if (customerId === providerId.toString()) {
            return res
                .status(400)
                .json({ message: 'You cannot book your own service' });
        }

        // ✅ Check: Provider exists
        const provider = await User.findById(providerId);
        if (!provider) {
            return res.status(404).json({ message: 'Provider not found' });
        }

        // ✅ Check: Provider is approved
        if (!provider.isApproved) {
            return res
                .status(400)
                .json({ message: 'This provider is not yet approved' });
        }

        // ✅ Check: Provider is available
        if (!provider.isAvailable) {
            return res
                .status(400)
                .json({ message: 'This provider is currently unavailable' });
        }

        // ✅ Use service's basePrice as priceAtBooking
        const priceAtBooking = service.basePrice;

        // Create booking
        const booking = await Booking.create({
            customerId,
            providerId,
            serviceId,
            address,
            dateTime,
            notes: notes || '',
            priceAtBooking,
            status: BOOKING_STATUS.REQUESTED,
        });

        // Populate details
        await booking.populate([
            { path: 'customerId', select: 'name email city area' },
            { path: 'providerId', select: 'name email city area isApproved isAvailable' },

            res.status(201).json({
                message: 'Booking created successfully',
                booking,
            })]);
    } catch (err) {
        next(err);
    }
};

// Get bookings (customer sees own bookings, provider sees bookings for their services)
export const getBookings = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        let filter = {};

        if (userRole === 'customer') {
            filter.customerId = userId;
        } else if (userRole === 'provider') {
            filter.providerId = userId;
        }

        const bookings = await Booking.find(filter).populate([
            { path: 'customerId', select: 'name email city area' },
            { path: 'providerId', select: 'name email city area' },
            { path: 'serviceId', select: 'title description basePrice' },
        ]);

        res.status(200).json({
            message: 'Bookings retrieved successfully',
            count: bookings.length,
            bookings,
        });
    } catch (err) {
        next(err);
    }
};

// Get single booking
export const getBookingById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const booking = await Booking.findById(id).populate([
            { path: 'customerId', select: 'name email city area' },
            { path: 'providerId', select: 'name email city area' },
            { path: 'serviceId', select: 'title description basePrice' },
        ]);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check if user is customer or provider of this booking
        if (
            booking.customerId._id.toString() !== userId &&
            booking.providerId._id.toString() !== userId
        ) {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        res.status(200).json({
            message: 'Booking retrieved successfully',
            booking,
        });
    } catch (err) {
        next(err);
    }
};

// Update booking status (provider only)
export const updateBookingStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user.id;

        // Validation
        if (!status) {
            return res.status(400).json({ message: 'Please provide new status' });
        }

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Only provider can update status
        if (booking.providerId.toString() !== userId) {
            return res
                .status(403)
                .json({ message: 'Only provider can update booking status' });
        }

        // Validate status transition
        if (!isValidStatusTransition(booking.status, status)) {
            return res.status(400).json({
                message: `Cannot transition from ${booking.status} to ${status}`,
                currentStatus: booking.status,
                allowedTransitions: getValidTransitions(booking.status),
            });
        }

        // Update status
        booking.status = status;
        await booking.save();

        await booking.populate([
            { path: 'customerId', select: 'name email city area' },
            { path: 'providerId', select: 'name email city area' },
            { path: 'serviceId', select: 'title description basePrice' },
        ]);

        res.status(200).json({
            message: 'Booking status updated successfully',
            booking,
        });
    } catch (err) {
        next(err);
    }
};

// Cancel booking (customer or provider)
export const cancelBooking = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check authorization
        if (
            userRole === 'customer' &&
            booking.customerId.toString() !== userId
        ) {
            return res
                .status(403)
                .json({ message: 'Only customer can cancel their booking' });
        }

        if (userRole === 'provider' && booking.providerId.toString() !== userId) {
            return res
                .status(403)
                .json({ message: 'Only provider can cancel this booking' });
        }

        // Check if can be cancelled
        if (!isValidStatusTransition(booking.status, BOOKING_STATUS.CANCELLED)) {
            return res.status(400).json({
                message: `Cannot cancel booking with status: ${booking.status}`,
            });
        }

        booking.status = BOOKING_STATUS.CANCELLED;
        await booking.save();

        await booking.populate([
            { path: 'customerId', select: 'name email city area' },
            { path: 'providerId', select: 'name email city area' },
            { path: 'serviceId', select: 'title description basePrice' },
        ]);

        res.status(200).json({
            message: 'Booking cancelled successfully',
            booking,
        });
    } catch (err) {
        next(err);
    }
};

// Helper function to get valid transitions
const getValidTransitions = (currentStatus) => {
    const validTransitions = {
        Requested: ['Accepted', 'Rejected', 'Cancelled'],
        Accepted: ['Completed', 'Cancelled'],
        Rejected: [],
        Completed: [],
        Cancelled: [],
    };

    return validTransitions[currentStatus] || [];
};
