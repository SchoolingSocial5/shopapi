import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Order from '../models/Order';
import Position from '../models/Position';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getStaff = async (req: Request, res: Response) => {
  try {
    const staff = await User.find({ status: 'staff' }).select('-password').sort({ createdAt: -1 });
    res.json(staff);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getCustomers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const skip = (page - 1) * limit;

    let query: any = { role: { $in: ['customer', 'user'] } };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await User.countDocuments(query);
    const customers = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      customers,
      pagination: {
        total,
        page,
        last_page: Math.ceil(total / limit),
        per_page: limit
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  const { role, status } = req.body;
  try {
    const updateData: any = {};
    if (role !== undefined) updateData.role = role;
    if (status !== undefined) updateData.status = status;

    const user = await User.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const orders = await Order.find({ userId: user._id }).sort({ createdAt: -1 });
    const userObj = user.toObject();
    (userObj as any).orders = orders;
    
    res.json(userObj);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.deleteOne();
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const skip = (page - 1) * limit;

    let query: any = { userId: id };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      orders,
      pagination: {
        total,
        page,
        last_page: Math.ceil(total / limit),
        per_page: limit
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const assignPosition = async (req: Request, res: Response) => {
  const { positionId } = req.body;
  const { id } = req.params;

  try {
    const position = await Position.findById(positionId);
    if (!position) return res.status(404).json({ message: 'Position not found' });

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.status = 'staff';
    user.positionId = position._id as any;
    user.staffPosition = position.name;
    user.staffRole = position.role;
    user.staffDuties = position.duties;
    user.staffSalary = position.salary;

    await user.save();

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const userId = (req as any).user.id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
