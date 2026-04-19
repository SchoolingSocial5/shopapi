import mongoose, { Schema, Document } from 'mongoose';

export interface IPosition extends Document {
  name: string;
  role: string;
  duties: string;
  salary: string;
  createdAt: Date;
  updatedAt: Date;
}

const PositionSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    duties: { type: String, required: true },
    salary: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

PositionSchema.virtual('created_at').get(function() { return this.createdAt; });
PositionSchema.virtual('updated_at').get(function() { return this.updatedAt; });

export default mongoose.model<IPosition>('Position', PositionSchema);
