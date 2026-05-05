import { Request, Response } from 'express';
import WholesaleProduct from '../models/WholesaleProduct';

export const getWholesaleProducts = async (req: Request, res: Response) => {
  try {
    const products = await WholesaleProduct.find().sort({ createdAt: -1 });
    // Map camelCase to snake_case for frontend
    const mappedProducts = products.map(p => ({
      ...p.toObject(),
      id: p.id,
      cost_price: p.costPrice || "",
      image_url: p.imageUrl || "",
      min_order_quantity: p.minOrderQuantity || 1,
    }));
    res.json(mappedProducts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getWholesaleProductById = async (req: Request, res: Response) => {
  try {
    const p = await WholesaleProduct.findById(req.params.id);
    if (!p) {
      return res.status(404).json({ message: 'Wholesale product not found' });
    }
    // Map camelCase to snake_case for frontend
    res.json({
      ...p.toObject(),
      id: p.id,
      cost_price: p.costPrice || "",
      image_url: p.imageUrl || "",
      min_order_quantity: p.minOrderQuantity || 1,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createWholesaleProduct = async (req: Request, res: Response) => {
  const { name, category, price, cost_price, color, quantity, description, min_order_quantity } = req.body;
  const imageUrl = req.file 
    ? (req.file as any).location || `/uploads/${req.file.filename}` 
    : null;

  try {
    const p = await WholesaleProduct.create({
      name,
      category,
      price,
      costPrice: cost_price,
      color,
      quantity: quantity || 0,
      imageUrl,
      description,
      minOrderQuantity: min_order_quantity,
    });
    
    res.status(201).json({
      ...p.toObject(),
      id: p.id,
      cost_price: p.costPrice || "",
      image_url: p.imageUrl || "",
      min_order_quantity: p.minOrderQuantity || 1,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateWholesaleProduct = async (req: Request, res: Response) => {
  try {
    const product = await WholesaleProduct.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Wholesale product not found' });
    }

    const updateData: any = { ...req.body };
    // Map snake_case to camelCase for DB
    if (req.body.cost_price !== undefined) updateData.costPrice = req.body.cost_price;
    if (req.body.image_url !== undefined) updateData.imageUrl = req.body.image_url;
    if (req.body.min_order_quantity !== undefined) updateData.minOrderQuantity = req.body.min_order_quantity;

    if (req.body.quantity !== undefined) {
      const adjustment = parseFloat(req.body.quantity);
      if (adjustment < 0) {
        updateData.quantity = product.quantity + adjustment;
      } else {
        updateData.quantity = adjustment;
      }
    }

    if (req.file) {
      updateData.imageUrl = (req.file as any).location || `/uploads/${req.file.filename}`;
    }

    const p = await WholesaleProduct.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!p) return res.status(404).json({ message: 'Wholesale product not found' });

    res.json({
      ...p.toObject(),
      id: p.id,
      cost_price: p.costPrice || "",
      image_url: p.imageUrl || "",
      min_order_quantity: p.minOrderQuantity || 1,
    });
  } catch (error: any) {
    console.error('Update Wholesale Product Error:', error);
    res.status(400).json({ message: error.message || 'Error updating wholesale product' });
  }
};

export const deleteWholesaleProduct = async (req: Request, res: Response) => {
  try {
    const product = await WholesaleProduct.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Wholesale product not found' });
    }
    await product.deleteOne();
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
