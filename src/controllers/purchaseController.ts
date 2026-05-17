import { Request, Response } from 'express';
import Purchase from '../models/Purchase';
import Product from '../models/Product';
import WholesaleProduct from '../models/WholesaleProduct';

export const getPurchases = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const productType = req.query.product_type as string;
    const skip = (page - 1) * limit;

    let query: any = {};

    if (productType) {
      if (productType === 'Retail') {
        const products = await Product.find().select('_id');
        const productIds = products.map(p => p._id);
        query.productId = { $in: productIds };
      } else if (productType === 'Whole') {
        const products = await WholesaleProduct.find().select('_id');
        const productIds = products.map(p => p._id);
        query.productId = { $in: productIds };
      }
    }

    const total = await Purchase.countDocuments(query);
    const purchases = await Purchase.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    // Map to the flat structure the frontend expects
    const mappedPurchases = await Promise.all(purchases.map(async (p) => {
      let product = await Product.findById(p.productId);
      let isWholesale = false;
      if (!product) {
        product = await WholesaleProduct.findById(p.productId) as any;
        isWholesale = true;
      }
      return {
        id: p.id,
        product_id: product?._id,
        product_name: product?.name || 'Deleted Product',
        product_category: isWholesale ? 'Wholesale' : (product?.category || ''),
        product_image: product?.imageUrl || null,
        quantity: p.quantity,
        cost_price: p.costPrice,
        total_amount: p.quantity * p.costPrice,
        created_at: p.date,
      };
    }));

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
      product.quantity = (product.quantity || 0) + parseFloat(quantity as string);
      await product.save();
    } else {
      const wholesaleProduct = await WholesaleProduct.findById(product_id);
      if (wholesaleProduct) {
        wholesaleProduct.quantity = (wholesaleProduct.quantity || 0) + parseFloat(quantity as string);
        await wholesaleProduct.save();
      }
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

