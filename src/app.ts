import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Import Routes
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import categoryRoutes from './routes/categoryRoutes';
import bannerRoutes from './routes/bannerRoutes';
import faqRoutes from './routes/faqRoutes';
import blogRoutes from './routes/blogRoutes';
import settingRoutes from './routes/settingRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import purchaseRoutes from './routes/purchaseRoutes';
import expenseRoutes from './routes/expenseRoutes';
import userRoutes from './routes/userRoutes';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Request Logger
app.use((req, res, next) => {
  const now = new Date();
  const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Database Connection
const mongodbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/schooling_shop';

mongoose.connect(mongodbUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api', authRoutes); // Auth routes (register, login)
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin/categories', categoryRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/admin/banners', bannerRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/admin/faqs', faqRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/admin/blogs', blogRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/admin/settings', settingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin/analytics', analyticsRoutes);
app.use('/api/admin/purchases', purchaseRoutes);
app.use('/api/admin/expenses', expenseRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Schooling Shop API is running' });
});

export default app;
