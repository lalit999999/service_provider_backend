import express from 'express';
import {
    createService,
    getServices,
    getServiceById,
    getMyServices,
    updateService,
    deleteService,
} from '../controllers/service.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getServices);
router.get('/:id', getServiceById);

// Provider routes
router.get('/my-services', authMiddleware, roleMiddleware(['provider']), getMyServices);
router.post('/', authMiddleware, roleMiddleware(['provider']), createService);
router.put('/:id', authMiddleware, roleMiddleware(['provider']), updateService);
router.delete('/:id', authMiddleware, roleMiddleware(['provider']), deleteService);

export default router;
