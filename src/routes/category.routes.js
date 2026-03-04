import express from 'express';
import {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
} from '../controllers/category.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Admin routes
router.post('/', authMiddleware, roleMiddleware(['admin']), createCategory);
router.put('/:id', authMiddleware, roleMiddleware(['admin']), updateCategory);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), deleteCategory);

export default router;
