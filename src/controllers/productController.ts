import { Request, Response } from 'express';
import Product from '../models/Product';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    // Map camelCase to snake_case for frontend
    const mappedProducts = products.map(p => ({
      ...p.toObject(),
      id: p.id,
      cost_price: p.costPrice || "",
      image_url: p.imageUrl || "",
    }));
    res.json(mappedProducts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) {
      return res.status(404).json({ message: 'Product not found' });
    }
    // Map camelCase to snake_case for frontend
    res.json({
      ...p.toObject(),
      id: p.id,
      cost_price: p.costPrice || "",
      image_url: p.imageUrl || "",
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  const { name, category, price, cost_price, color, quantity, description } = req.body;
  const imageUrl = req.file 
    ? (req.file as any).location || `/uploads/${req.file.filename}` 
    : null;

  try {
    const p = await Product.create({
      name,
      category,
      price,
      costPrice: cost_price,
      color,
      quantity: quantity || 0,
      imageUrl,
      description,
    });
    
    res.status(201).json({
      ...p.toObject(),
      id: p.id,
      cost_price: p.costPrice || "",
      image_url: p.imageUrl || "",
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updateData: any = { ...req.body };
    // Map snake_case to camelCase for DB
    if (req.body.cost_price !== undefined) updateData.costPrice = req.body.cost_price;
    if (req.body.image_url !== undefined) updateData.imageUrl = req.body.image_url;

    if (req.file) {
      updateData.imageUrl = (req.file as any).location || `/uploads/${req.file.filename}`;
    }

    const p = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    if (!p) return res.status(404).json({ message: 'Product not found' });

    res.json({
      ...p.toObject(),
      id: p.id,
      cost_price: p.costPrice || "",
      image_url: p.imageUrl || "",
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    await product.deleteOne();
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
