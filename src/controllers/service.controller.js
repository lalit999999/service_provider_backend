import Service from '../models/Service.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import { isValidObjectId } from '../utils/validateObjectId.js';

// Create service (provider only)
export const createService = async (req, res, next) => {
    try {
        const { categoryId, title, description, basePrice } = req.body;
        const providerId = req.user.id; // From auth middleware

        // Validation
        if (!categoryId || !title || !description || !basePrice) {
            return res
                .status(400)
                .json({ message: 'Please provide all required fields' });
        }

        // Create service
        const service = await Service.create({
            providerId,
            categoryId,
            title,
            description,
            basePrice,
        });

        // Populate provider and category details
        await service.populate([
            { path: 'providerId', select: 'name email city area' },
            { path: 'categoryId', select: 'name description' },
        ]);

        res.status(201).json({
            message: 'Service created successfully',
            service,
        });
    } catch (err) {
        next(err);
    }
};

// Get all services with filtering
export const getServices = async (req, res, next) => {
    try {
        const { category, city } = req.query;
        let filter = {};

        // Filter by category
        if (category) {
            const categoryObj = await Category.findOne({ name: new RegExp(category, 'i') });
            if (categoryObj) {
                filter.categoryId = categoryObj._id;
            }
        }

        // If city filter is needed, fetch providers in that city first
        if (city) {
            const providers = await User.find({ city: new RegExp(city, 'i') }).select('_id');
            const providerIds = providers.map(p => p._id);
            filter.providerId = { $in: providerIds };
        }

        // Get services
        const services = await Service.find(filter).populate([
            { path: 'providerId', select: 'name email city area' },
            { path: 'categoryId', select: 'name description' },
        ]);

        res.status(200).json({
            message: 'Services retrieved successfully',
            count: services.length,
            services,
        });
    } catch (err) {
        next(err);
    }
};

// Get single service by ID
export const getServiceById = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Validate ObjectId
        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid service ID format' });
        }

        const service = await Service.findById(id).populate([
            { path: 'providerId', select: 'name email city area' },
            { path: 'categoryId', select: 'name description' },
        ]);

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        res.status(200).json({
            message: 'Service retrieved successfully',
            service,
        });
    } catch (err) {
        next(err);
    }
};

// Update service (provider only)
export const updateService = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description, basePrice } = req.body;
        const providerId = req.user.id;

        // Validate ObjectId
        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid service ID format' });
        }

        // Check if service exists and belongs to this provider
        const service = await Service.findById(id);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        if (service.providerId.toString() !== providerId) {
            return res
                .status(403)
                .json({ message: 'You can only update your own services' });
        }

        // Update service
        const updatedService = await Service.findByIdAndUpdate(
            id,
            { title, description, basePrice },
            { new: true, runValidators: true }
        ).populate([
            { path: 'providerId', select: 'name email city area' },
            { path: 'categoryId', select: 'name description' },
        ]);

        res.status(200).json({
            message: 'Service updated successfully',
            service: updatedService,
        });
    } catch (err) {
        next(err);
    }
};

// Delete service (provider only)
export const deleteService = async (req, res, next) => {
    try {
        const { id } = req.params;
        const providerId = req.user.id;

        // Validate ObjectId
        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid service ID format' });
        }

        // Check if service exists and belongs to this provider
        const service = await Service.findById(id);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        if (service.providerId.toString() !== providerId) {
            return res
                .status(403)
                .json({ message: 'You can only delete your own services' });
        }

        // Delete service
        await Service.findByIdAndDelete(id);

        res.status(200).json({
            message: 'Service deleted successfully',
        });
    } catch (err) {
        next(err);
    }
};
