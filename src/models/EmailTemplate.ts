import mongoose, { Schema, Document } from 'mongoose';

export interface IEmailTemplate extends Document {
  name: string;
  title: string;
  banner?: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const EmailTemplateSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    title: { type: String, required: true },
    banner: { type: String },
    content: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export default mongoose.model<IEmailTemplate>('EmailTemplate', EmailTemplateSchema);
