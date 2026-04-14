import mongoose, { Schema, Document } from 'mongoose';

export interface IFaq extends Document {
  question: string;
  answer: string;
}

const FaqSchema: Schema = new Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  {
    timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true },
  }
);

export default mongoose.model<IFaq>('Faq', FaqSchema);
