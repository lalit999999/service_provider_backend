import Category from '../models/Category.js';

// Create category (admin only)
export const createCategory = async (req, res, next) => {
    try {
        const { name, description } = req.body;

        // Validation
        if (!name || !description) {
            return res
                .status(400)
                .json({ message: 'Please provide name and description' });
        }

        // Check if category already exists
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ message: 'Category already exists' });
        }

        // Create category
        const category = await Category.create({ name, description });

        res.status(201).json({
            message: 'Category created successfully',
            category,
        });
    } catch (err) {
        next(err);
    }
};

// Get all categories (public)
export const getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find();

        res.status(200).json({
            message: 'Categories retrieved successfully',
            count: categories.length,
            categories,
        });
    } catch (err) {
        next(err);
    }
};

// Get single category by ID
export const getCategoryById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.status(200).json({
            message: 'Category retrieved successfully',
            category,
        });
    } catch (err) {
        next(err);
    }
};

// Update category (admin only)
export const updateCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const category = await Category.findByIdAndUpdate(
            id,
            { name, description },
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.status(200).json({
            message: 'Category updated successfully',
            category,
        });
    } catch (err) {
        next(err);
    }
};

// Delete category (admin only)
export const deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params;

        const category = await Category.findByIdAndDelete(id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.status(200).json({
            message: 'Category deleted successfully',
            category,
        });
    } catch (err) {
        next(err);
    }
};
