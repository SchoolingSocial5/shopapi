import mongoose, { Schema, Document } from 'mongoose';

export interface IWholesaleProduct extends Document {
  name: string;
  category: string;
  price: string;
  costPrice?: string;
  color: string;
  quantity: number;
  imageUrl?: string;
  description?: string;
  minOrderQuantity?: number;
  createdAt: Date;
  updatedAt: Date;
}

const WholesaleProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: String, required: true },
    costPrice: { type: String },
    color: { type: String, required: true },
    quantity: { type: Number, default: 0, min: [0, 'Quantity cannot be less than zero'] },
    imageUrl: { type: String },
    description: { type: String },
    minOrderQuantity: { type: Number, default: 1 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export default mongoose.model<IWholesaleProduct>('WholesaleProduct', WholesaleProductSchema);
