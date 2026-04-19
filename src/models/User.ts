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
  positionId?: mongoose.Types.ObjectId;
  staffPosition?: string;
  staffRole?: string;
  staffDuties?: string;
  staffSalary?: string;
  resetCode?: string;
  resetCodeExpiry?: Date;
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
    positionId: { type: Schema.Types.ObjectId, ref: 'Position' },
    staffPosition: { type: String },
    staffRole: { type: String },
    staffDuties: { type: String },
    staffSalary: { type: String },
    resetCode: { type: String },
    resetCodeExpiry: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtuals for Customer Statistics (Snake Case)
UserSchema.virtual('orders_count').get(function() { return this.totalOrders; });
UserSchema.virtual('orders_sum_total_amount').get(function() { return this.totalSpent; });
UserSchema.virtual('created_at').get(function() { return this.createdAt; });
UserSchema.virtual('updated_at').get(function() { return this.updatedAt; });

export default mongoose.model<IUser>('User', UserSchema);
