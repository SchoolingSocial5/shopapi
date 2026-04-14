import mongoose, { Schema, Document } from 'mongoose';

export interface ISocialActivity extends Document {
  platformId: mongoose.Types.ObjectId;
  type: string;
  date: Date;
  count: number;
}

const SocialActivitySchema: Schema = new Schema(
  {
    platformId: { type: Schema.Types.ObjectId, ref: 'SocialPlatform', required: true },
    type: { type: String, required: true },
    date: { type: Date, required: true },
    count: { type: Number, default: 0 },
  },
  {
    timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true },
  }
);

export default mongoose.model<ISocialActivity>('SocialActivity', SocialActivitySchema);
