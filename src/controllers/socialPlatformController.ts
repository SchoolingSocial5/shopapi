import { Request, Response } from 'express';
import SocialPlatform from '../models/SocialPlatform';

export const getSocialPlatforms = async (req: Request, res: Response) => {
  try {
    const platforms = await SocialPlatform.find({ isActive: true });
    res.json(platforms.map(p => ({
      id: p._id,
      platform: p.name,
      url: p.url,
      icon: p.icon,
      handle: p.handle
    })));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createSocialPlatform = async (req: Request, res: Response) => {
  try {
    const platform = new SocialPlatform(req.body);
    await platform.save();
    res.status(201).json(platform);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
