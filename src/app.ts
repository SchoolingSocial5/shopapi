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
import positionRoutes from './routes/positionRoutes';
import socialPlatformRoutes from './routes/socialPlatformRoutes';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request Logging Middleware
app.use((req, res, next) => {
  const time = new Date().toLocaleString();
  console.log(`[${time}] ${req.method} ${req.url}`);
  next();
});

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Database Connection
const mongodbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/schooling_shop';

mongoose.connect(mongodbUri, {
  family: 4, // Force IPv4 to avoid DNS ENOTFOUND issues
  serverSelectionTimeoutMS: 5000,
})
  .then(() => {
    console.log('--- Database Status ---');
    console.log('Connected to MongoDB Atlas');
    console.log('Host:', new URL(mongodbUri.replace('mongodb+srv://', 'http://')).hostname);
    console.log('-----------------------');
  })
  .catch((err) => {
    console.error('--- Database Connection Error ---');
    console.error('Error Code:', err.code);
    console.error('Message:', err.message);
    console.error('Check your internet connection and IP whitelist on MongoDB Atlas.');
    console.error('---------------------------------');
  });

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
app.use('/api/admin/users', userRoutes);
app.use('/api/admin/analytics', analyticsRoutes);
app.use('/api/admin/purchases', purchaseRoutes);
app.use('/api/admin/expenses', expenseRoutes);
app.use('/api/admin/positions', positionRoutes);
app.use('/api/social-media', socialPlatformRoutes);
app.use('/api/admin/social-media', socialPlatformRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Schooling Shop API is running' });
});

// Error Handling Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'An internal server error occurred',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

export default app;
