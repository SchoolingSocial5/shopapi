import { Router } from 'express';
import { getBlogs, createBlog, updateBlog, deleteBlog } from '../controllers/blogController';
import { protect, adminOnly } from '../middleware/auth';
import upload from '../middleware/upload';

const router = Router();

router.get('/', getBlogs);
router.post('/', protect, adminOnly, upload.single('image'), createBlog);
router.post('/:id', protect, adminOnly, upload.single('image'), updateBlog);
router.put('/:id', protect, adminOnly, upload.single('image'), updateBlog);
router.delete('/:id', protect, adminOnly, deleteBlog);

export default router;
