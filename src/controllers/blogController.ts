import { Request, Response } from 'express';
import Blog from '../models/Blog';

export const getBlogs = async (req: Request, res: Response) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createBlog = async (req: Request, res: Response) => {
  const { title, content } = req.body;
  const imageUrl = req.file 
    ? (req.file as any).location || `/uploads/${req.file.filename}` 
    : undefined;
  try {
    const blog = await Blog.create({ title, content, imageUrl });
    res.status(201).json(blog);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateBlog = async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    if (req.file) {
      blog.imageUrl = (req.file as any).location || `/uploads/${req.file.filename}`;
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $set: { ...req.body, imageUrl: blog.imageUrl } },
      { new: true }
    );
    res.json(updatedBlog);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteBlog = async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    await blog.deleteOne();
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
