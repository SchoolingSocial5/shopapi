import mongoose, { Schema, Document } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  category?: string;
  subtitle?: string;
  content: string;
  imageUrl?: string;
}

const BlogSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    category: { type: String },
    content: { type: String, required: true },
    imageUrl: { type: String },
  },
  {
    timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true },
  }
);

export default mongoose.model<IBlog>('Blog', BlogSchema);
