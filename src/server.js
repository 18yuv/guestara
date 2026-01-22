import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import categoryRoutes from './routes/categoryRoutes.js';
import connectMongo from './config/connection.js';
import subcategoryRoutes from './routes/subcategoryRoutes.js';
import itemRoutes from './routes/itemRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';

import { errorHandler } from './middlewares/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3000;

await connectMongo()

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subcategoryRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/bookings', bookingRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});