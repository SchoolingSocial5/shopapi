import { Request, Response } from 'express';
import Banner from '../models/Banner';

export const getBanners = async (req: Request, res: Response) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    const mappedBanners = banners.map(b => ({
      id: b.id,
      image_url: b.imageUrl,
      category: b.category,
      title: b.title || "",
      subtitle: b.subtitle || "",
      createdAt: b.createdAt,
    }));
    res.json(mappedBanners);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createBanner = async (req: Request, res: Response) => {
  const { category, title, subtitle } = req.body;
  const imageUrl = req.file 
    ? (req.file as any).location || `/uploads/${req.file.filename}` 
    : null;
  if (!imageUrl) return res.status(400).json({ message: 'Image is required' });

  try {
    const banner = await Banner.create({ imageUrl, category, title, subtitle });
    res.status(201).json({
      id: banner.id,
      image_url: banner.imageUrl,
      category: banner.category,
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      createdAt: banner.createdAt,
    });
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

export const updateBanner = async (req: Request, res: Response) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: 'Banner not found' });

    const { category, title, subtitle } = req.body;
    
    if (category !== undefined) banner.category = category;
    if (title !== undefined) banner.title = title;
    if (subtitle !== undefined) banner.subtitle = subtitle;

    if (req.file) {
      banner.imageUrl = (req.file as any).location || `/uploads/${req.file.filename}`;
    }

    await banner.save();

    res.json({
      id: banner.id,
      image_url: banner.imageUrl,
      category: banner.category,
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      createdAt: banner.createdAt,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
