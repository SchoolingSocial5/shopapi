import { Request, Response } from 'express';
import Banner from '../models/Banner';

export const getBanners = async (req: Request, res: Response) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    const mappedBanners = banners.map(b => ({
      ...b.toObject(),
      id: b.id,
      image_url: b.imageUrl,
    }));
    res.json(mappedBanners);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createBanner = async (req: Request, res: Response) => {
  const { category } = req.body;
  const imageUrl = req.file 
    ? (req.file as any).location || `/uploads/${req.file.filename}` 
    : null;
  if (!imageUrl) return res.status(400).json({ message: 'Image is required' });

  try {
    const banner = await Banner.create({ imageUrl, category });
    res.status(201).json(banner);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteBanner = async (req: Request, res: Response) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: 'Banner not found' });
    await banner.deleteOne();
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
