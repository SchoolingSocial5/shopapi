import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  category: string;
  price: string;
  costPrice?: string;
  color: string;
  quantity: number;
  imageUrl?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: String, required: true },
    costPrice: { type: String },
    color: { type: String, required: true },
    quantity: { type: Number, default: 0 },
    imageUrl: { type: String },
    description: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export default mongoose.model<IProduct>('Product', ProductSchema);
