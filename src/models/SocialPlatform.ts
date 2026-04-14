import mongoose, { Schema, Document } from 'mongoose';

export interface ISocialPlatform extends Document {
  name: string;
  url?: string;
  handle?: string;
  icon?: string;
  isActive: boolean;
}

const SocialPlatformSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    url: { type: String },
    handle: { type: String },
    icon: { type: String },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ISocialPlatform>('SocialPlatform', SocialPlatformSchema);
