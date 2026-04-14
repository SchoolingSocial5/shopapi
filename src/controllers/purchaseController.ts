import { Request, Response } from 'express';
import Purchase from '../models/Purchase';
import Product from '../models/Product';

export const getPurchases = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const total = await Purchase.countDocuments();
    const purchases = await Purchase.find()
      .populate('productId')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    // Map to the flat structure the frontend expects
    const mappedPurchases = purchases.map(p => {
      const product = p.productId as any;
      return {
        id: p.id,
        product_id: product?._id,
        product_name: product?.name || 'Deleted Product',
        product_category: product?.category || '',
        product_image: product?.imageUrl || null,
        quantity: p.quantity,
        cost_price: p.costPrice,
        total_amount: p.quantity * p.costPrice,
        created_at: p.date,
      };
    });

    res.json({
      purchases: mappedPurchases,
      pagination: {
        total,
        page,
        last_page: Math.ceil(total / limit),
        per_page: limit,
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createPurchase = async (req: Request, res: Response) => {
  const { product_id, quantity, cost_price, date } = req.body;

  try {
    // 1. Map fields and create the purchase
    const purchase = await Purchase.create({
      productId: product_id,
      quantity,
      costPrice: cost_price,
      date: date || new Date(),
    });

    // 2. Update the product stock
    const product = await Product.findById(product_id);
    if (product) {
      product.quantity = (product.quantity || 0) + Number(quantity);
      await product.save();
    }

    res.status(201).json(purchase);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deletePurchase = async (req: Request, res: Response) => {
  try {
    const purchase = await Purchase.findByIdAndDelete(req.params.id);
    if (!purchase) return res.status(404).json({ message: 'Purchase not found' });
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
