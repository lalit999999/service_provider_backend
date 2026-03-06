import Booking from '../models/Booking.js';
import { isValidStatusTransition, getValidTransitions, BOOKING_STATUS } from '../constants/bookingStatus.js';
import User from '../models/User.js';
import { uploadImage, deleteImage } from '../config/cloudinary.js';
import { isValidObjectId } from '../utils/validateObjectId.js';

// Create booking (customer only)
export const createBooking = async (req, res, next) => {
    try {
        const { serviceId, address, dateTime, notes } = req.body;
        const customerId = req.user.id;

        // Validation
        if (!serviceId || !address || !dateTime) {
            console.error('Booking validation failed:', {
                received: req.body,
                serviceId,
                address,
                dateTime,
                customerId,
            });
            return res
                .status(400)
                .json({
                    message: 'Please provide serviceId, address, and dateTime',
                    missing: {
                        serviceId: !serviceId,
                        address: !address,
                        dateTime: !dateTime,
                    }
                });
        }

        // Get service to find provider
        const Service = (await import('../models/Service.js')).default;
        const service = await Service.findById(serviceId);
        if (!service) {
            console.error('Service not found:', { serviceId });
            return res.status(404).json({ message: 'Service not found' });
        }

        const providerId = service.providerId;

        // ✅ Check: Customer is not booking their own service
        if (customerId === providerId.toString()) {
            console.warn('Customer trying to book own service:', { customerId, providerId });
            return res
                .status(400)
                .json({ message: 'You cannot book your own service' });
        }

        // ✅ Check: Provider exists
        const provider = await User.findById(providerId);
        if (!provider) {
            console.error('Provider not found:', { providerId });
            return res.status(404).json({ message: 'Provider not found' });
        }

        // ✅ Check: Provider is approved
        if (!provider.isApproved) {
            console.warn('Provider not approved:', { providerId, isApproved: provider.isApproved });
            return res
                .status(400)
                .json({ message: 'This provider is not yet approved' });
        }

        // ✅ Check: Provider is available
        if (!provider.isAvailable) {
            console.warn('Provider unavailable:', { providerId, isAvailable: provider.isAvailable });
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

        // Validate ObjectId
        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid booking ID format' });
        }

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

// Accept booking (provider only) - Requested → Confirmed
export const acceptBooking = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Validate ObjectId
        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid booking ID format' });
        }

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Only provider can accept
        if (booking.providerId.toString() !== userId) {
            return res
                .status(403)
                .json({ message: 'Only provider can accept this booking' });
        }

        // Check if booking is in Requested status
        if (booking.status !== BOOKING_STATUS.REQUESTED) {
            return res.status(400).json({
                message: `Cannot accept booking with status: ${booking.status}. Only Requested bookings can be accepted.`,
                currentStatus: booking.status,
            });
        }

        // Update status to Accepted
        booking.status = BOOKING_STATUS.ACCEPTED;
        await booking.save();

        await booking.populate([
            { path: 'customerId', select: 'name email city area' },
            { path: 'providerId', select: 'name email city area' },
            { path: 'serviceId', select: 'title description basePrice' },
        ]);

        res.status(200).json({
            message: 'Booking accepted successfully',
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

        // Validate ObjectId
        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid booking ID format' });
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

// Cancel booking
export const cancelBooking = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Validate ObjectId
        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid booking ID format' });
        }

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

        // ✅ Customer can only cancel if status is Requested or Confirmed
        if (userRole === 'customer') {
            if (
                booking.status !== BOOKING_STATUS.REQUESTED &&
                booking.status !== BOOKING_STATUS.CONFIRMED
            ) {
                return res.status(400).json({
                    message: `Customers can only cancel bookings with status: ${BOOKING_STATUS.REQUESTED} or ${BOOKING_STATUS.CONFIRMED}`,
                    currentStatus: booking.status,
                });
            }
        }

        // Check if can be cancelled (using valid transitions)
        if (!isValidStatusTransition(booking.status, BOOKING_STATUS.CANCELLED)) {
            return res.status(400).json({
                message: `Cannot cancel booking with status: ${booking.status}`,
                currentStatus: booking.status,
                allowedTransitions: getValidTransitions(booking.status),
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

// Reschedule booking (customer only)
export const rescheduleBooking = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { dateTime } = req.body;
        const customerId = req.user.id;

        // Validation
        if (!dateTime) {
            return res.status(400).json({ message: 'Please provide new dateTime' });
        }

        // Validate ObjectId
        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid booking ID format' });
        }

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check authorization - only customer can reschedule their booking
        if (booking.customerId.toString() !== customerId) {
            return res
                .status(403)
                .json({ message: 'Only customer can reschedule their booking' });
        }

        // ✅ Customer can only reschedule if status is Requested or Confirmed
        if (
            booking.status !== BOOKING_STATUS.REQUESTED &&
            booking.status !== BOOKING_STATUS.CONFIRMED
        ) {
            return res.status(400).json({
                message: `Bookings can only be rescheduled with status: ${BOOKING_STATUS.REQUESTED} or ${BOOKING_STATUS.CONFIRMED}`,
                currentStatus: booking.status,
            });
        }

        // Update dateTime
        const newDate = new Date(dateTime);
        if (isNaN(newDate.getTime())) {
            return res.status(400).json({ message: 'Invalid dateTime format' });
        }

        booking.dateTime = newDate;
        await booking.save();

        await booking.populate([
            { path: 'customerId', select: 'name email city area' },
            { path: 'providerId', select: 'name email city area' },
            { path: 'serviceId', select: 'title description basePrice' },
        ]);

        res.status(200).json({
            message: 'Booking rescheduled successfully',
            booking,
        });
    } catch (err) {
        next(err);
    }
};

// Upload customer issue image
export const uploadCustomerImage = async (req, res, next) => {
    try {
        const { bookingId } = req.params;
        const customerId = req.user.id;

        // Validate ObjectId
        if (!isValidObjectId(bookingId)) {
            return res.status(400).json({ message: 'Invalid booking ID format' });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Verify customer owns this booking
        if (booking.customerId.toString() !== customerId) {
            return res.status(403).json({ message: 'Only customer can upload issue image for this booking' });
        }

        // Verify booking status
        if (!['Accepted', 'Completed'].includes(booking.status)) {
            return res.status(400).json({ message: 'Issue image can only be uploaded after provider accepts the booking' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        // Delete old image from Cloudinary if exists
        if (booking.customerImage?.url) {
            const publicId = booking.customerImage.url.split('/').pop().split('.')[0];
            try {
                await deleteImage(`bookings/customer/${publicId}`);
            } catch (err) {
                console.error('Error deleting old image:', err);
            }
        }

        // Upload new image to Cloudinary
        const uploadResult = await uploadImage(req.file.buffer, 'bookings/customer');

        // Update booking with new customer image
        booking.customerImage = {
            url: uploadResult.url,
            uploadedAt: new Date(),
            uploadedBy: customerId,
        };

        await booking.save();

        await booking.populate([
            { path: 'customerId', select: 'name email city area' },
            { path: 'providerId', select: 'name email city area' },
            { path: 'serviceId', select: 'title description basePrice' },
        ]);

        res.status(200).json({
            message: 'Customer image uploaded successfully',
            booking,
        });
    } catch (err) {
        next(err);
    }
};

// Upload provider work image (before/after)
export const uploadProviderWorkImage = async (req, res, next) => {
    try {
        const { bookingId } = req.params;
        const { type } = req.query;
        const providerId = req.user.id;

        // Validate image type
        if (!['before', 'after'].includes(type)) {
            return res.status(400).json({ message: "Image type must be 'before' or 'after'" });
        }

        // Validate ObjectId
        if (!isValidObjectId(bookingId)) {
            return res.status(400).json({ message: 'Invalid booking ID format' });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Verify provider owns this booking
        if (booking.providerId.toString() !== providerId) {
            return res.status(403).json({ message: 'Only provider can upload work images for this booking' });
        }

        // Verify booking status
        if (!['Accepted', 'Completed'].includes(booking.status)) {
            return res.status(400).json({ message: 'Work images can only be uploaded when booking is active' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        // Upload image to Cloudinary
        const uploadResult = await uploadImage(req.file.buffer, 'bookings/provider');

        // Add image to providerImages array
        booking.providerImages.push({
            type,
            url: uploadResult.url,
            uploadedAt: new Date(),
            uploadedBy: providerId,
        });

        await booking.save();

        await booking.populate([
            { path: 'customerId', select: 'name email city area' },
            { path: 'providerId', select: 'name email city area' },
            { path: 'serviceId', select: 'title description basePrice' },
        ]);

        res.status(200).json({
            message: `Provider ${type} image uploaded successfully`,
            booking,
        });
    } catch (err) {
        next(err);
    }
};

// Add notes to booking (provider only)
export const addNotes = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { workNotes } = req.body;
        const userId = req.user.id;

        // Validation
        if (!workNotes || !workNotes.trim()) {
            return res.status(400).json({ message: 'Please provide work notes' });
        }

        // Validate ObjectId
        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid booking ID format' });
        }

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Only provider can add notes
        if (booking.providerId.toString() !== userId) {
            return res.status(403).json({ message: 'Only provider can add notes to this booking' });
        }

        // Update work notes
        booking.workNotes = workNotes.trim();
        await booking.save();

        await booking.populate([
            { path: 'customerId', select: 'name email city area' },
            { path: 'providerId', select: 'name email city area' },
            { path: 'serviceId', select: 'title description basePrice' },
        ]);

        res.status(200).json({
            message: 'Work notes added successfully',
            booking,
        });
    } catch (err) {
        next(err);
    }
};
