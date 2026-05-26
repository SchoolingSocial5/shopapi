import { Request, Response } from 'express';
import NotificationTemplate from '../models/NotificationTemplate';

export const getNotificationTemplates = async (req: Request, res: Response) => {
  try {
    const templates = await NotificationTemplate.find().sort({ createdAt: -1 });
    res.json(templates);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createNotificationTemplate = async (req: Request, res: Response) => {
  const { name, title, content, isUserRead, isAdminRead } = req.body;

  try {
    const template = await NotificationTemplate.create({
      name,
      title,
      content,
      isUserRead: isUserRead !== undefined ? isUserRead : false,
      isAdminRead: isAdminRead !== undefined ? isAdminRead : false,
    });
    res.status(201).json(template);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateNotificationTemplate = async (req: Request, res: Response) => {
  try {
    const template = await NotificationTemplate.findById(req.params.id);
    if (!template) return res.status(404).json({ message: 'Notification template not found' });

    const { name, title, content, isUserRead, isAdminRead } = req.body;

    if (name !== undefined) template.name = name;
    if (title !== undefined) template.title = title;
    if (content !== undefined) template.content = content;
    if (isUserRead !== undefined) template.isUserRead = isUserRead;
    if (isAdminRead !== undefined) template.isAdminRead = isAdminRead;

    await template.save();
    res.json(template);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteNotificationTemplate = async (req: Request, res: Response) => {
  try {
    const template = await NotificationTemplate.findById(req.params.id);
    if (!template) return res.status(404).json({ message: 'Notification template not found' });
    await template.deleteOne();
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
