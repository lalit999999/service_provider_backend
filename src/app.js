// src/app.js
import express from 'express';
import cors from 'cors';
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import categoryRoutes from './routes/category.routes.js';
import serviceRoutes from './routes/service.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import reviewRoutes from './routes/review.routes.js';
import adminRoutes from './routes/admin.routes.js';
import uploadRoutes from './routes/upload.routes.js';


const app = express();

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173', // Your Vite URL
    credentials: true,               // Required for withCredentials: true
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],// Allows your interceptor's header
    optionsSuccessStatus: 200
}));

// routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);


// global error handler
app.use((err, req, res, next) => {
    console.error(err);
    res
        .status(err.status || 500)
        .json({ message: err.message || 'Internal Server Error' });
});

export default app;