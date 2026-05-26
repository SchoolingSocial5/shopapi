import { Request, Response } from 'express';
import EmailTemplate from '../models/EmailTemplate';

export const getEmailTemplates = async (req: Request, res: Response) => {
  try {
    const templates = await EmailTemplate.find().sort({ createdAt: -1 });
    res.json(templates);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createEmailTemplate = async (req: Request, res: Response) => {
  const { name, title, content } = req.body;
  const banner = req.file
    ? (req.file as any).location || `/uploads/${req.file.filename}`
    : undefined;

  try {
    const template = await EmailTemplate.create({ name, title, banner, content });
    res.status(201).json(template);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateEmailTemplate = async (req: Request, res: Response) => {
  try {
    const template = await EmailTemplate.findById(req.params.id);
    if (!template) return res.status(404).json({ message: 'Email template not found' });

    const { name, title, content } = req.body;

    if (name !== undefined) template.name = name;
    if (title !== undefined) template.title = title;
    if (content !== undefined) template.content = content;

    if (req.file) {
      template.banner = (req.file as any).location || `/uploads/${req.file.filename}`;
    }

    await template.save();
    res.json(template);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteEmailTemplate = async (req: Request, res: Response) => {
  try {
    const template = await EmailTemplate.findById(req.params.id);
    if (!template) return res.status(404).json({ message: 'Email template not found' });
    await template.deleteOne();
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
