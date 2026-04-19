import { Request, Response } from 'express';
import Position from '../models/Position';

export const getPositions = async (req: Request, res: Response) => {
  try {
    const positions = await Position.find().sort({ createdAt: -1 });
    res.json(positions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createPosition = async (req: Request, res: Response) => {
  const { name, role, duties, salary } = req.body;
  try {
    const position = await Position.create({ name, role, duties, salary });
    res.status(201).json(position);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updatePosition = async (req: Request, res: Response) => {
  try {
    const position = await Position.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!position) return res.status(404).json({ message: 'Position not found' });
    res.json(position);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deletePosition = async (req: Request, res: Response) => {
  try {
    const position = await Position.findById(req.params.id);
    if (!position) return res.status(404).json({ message: 'Position not found' });
    await position.deleteOne();
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
