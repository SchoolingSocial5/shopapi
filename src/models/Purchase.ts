import mongoose, { Schema, Document } from 'mongoose';

export interface IPurchase extends Document {
  productId: mongoose.Types.ObjectId;
  quantity: number;
  costPrice: number;
  date: Date;
  productImage?: string;
}

const PurchaseSchema: Schema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    costPrice: { type: Number, required: true },
    date: { type: Date, required: true },
    productImage: { type: String },
  },
  {
    timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true },
  }
);

export default mongoose.model<IPurchase>('Purchase', PurchaseSchema);
