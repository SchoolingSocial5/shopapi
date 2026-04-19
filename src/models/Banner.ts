import mongoose, { Schema, Document } from 'mongoose';

export interface IBanner extends Document {
  imageUrl: string;
  category?: string;
  title?: string;
  subtitle?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BannerSchema: Schema = new Schema(
  {
    imageUrl: { type: String, required: true },
    category: { type: String },
    title: { type: String },
    subtitle: { type: String },
  },
  {
    timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true },
  }
);

export default mongoose.model<IBanner>('Banner', BannerSchema);
