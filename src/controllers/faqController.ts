import { Request, Response } from 'express';
import Faq from '../models/Faq';

export const getFaqs = async (req: Request, res: Response) => {
  try {
    const faqs = await Faq.find().sort({ createdAt: -1 });
    res.json(faqs);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createFaq = async (req: Request, res: Response) => {
  const { question, answer } = req.body;
  try {
    const faq = await Faq.create({ question, answer });
    res.status(201).json(faq);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateFaq = async (req: Request, res: Response) => {
  try {
    const faq = await Faq.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!faq) return res.status(404).json({ message: 'FAQ not found' });
    res.json(faq);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteFaq = async (req: Request, res: Response) => {
  try {
    const faq = await Faq.findById(req.params.id);
    if (!faq) return res.status(404).json({ message: 'FAQ not found' });
    await faq.deleteOne();
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
