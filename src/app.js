// src/app.js
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import categoryRoutes from './routes/category.routes.js';
import serviceRoutes from './routes/service.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import reviewRoutes from './routes/review.routes.js';

const app = express();

app.use(express.json());
app.use(cors());

// routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);

// global error handler
app.use((err, req, res, next) => {
    console.error(err);
    res
        .status(err.status || 500)
        .json({ message: err.message || 'Internal Server Error' });
});

export default app;