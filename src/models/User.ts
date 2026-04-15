import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: string;
  status: string;
  phone?: string;
  address?: string;
  totalOrders: number;
  totalSpent: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'customer' },
    status: { type: String, default: 'user' },
    phone: { type: String },
    address: { type: String },
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>('User', UserSchema);
