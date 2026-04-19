import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { generateToken } from '../utils/jwt';

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    if (user) {
      res.status(201).json({
        access_token: generateToken({ id: user.id }),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          phone: user.phone,
          address: user.address,
          staffPosition: user.staffPosition,
          staffRole: user.staffRole,
          staffDuties: user.staffDuties,
          staffSalary: user.staffSalary,
        },
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      if (user.status === 'suspended') {
        return res.status(403).json({ message: 'Your account has been suspended. Please contact the administrator.' });
      }
      res.json({
        access_token: generateToken({ id: user.id }),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          phone: user.phone,
          address: user.address,
          staffPosition: user.staffPosition,
          staffRole: user.staffRole,
          staffDuties: user.staffDuties,
          staffSalary: user.staffSalary,
        },
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.json({ message: 'Logged out successfully' });
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    // Always return success to prevent user enumeration
    if (user) {
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      user.resetCode = resetCode;
      user.resetCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      await user.save();
      
      console.log(`Reset code for ${email}: ${resetCode}`); // Log for development
    }

    res.json({ message: 'If an account exists with this email, a 6-digit verification code has been sent.' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyCode = async (req: Request, res: Response) => {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({
      email,
      resetCode: code,
      resetCodeExpiry: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    res.json({ message: 'Code verified successfully', email });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, code, newPassword } = req.body;

  try {
    const user = await User.findOne({
      email,
      resetCode: code,
      resetCodeExpiry: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetCode = undefined;
    user.resetCodeExpiry = undefined;
    await user.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
