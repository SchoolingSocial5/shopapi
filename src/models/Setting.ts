import mongoose, { Schema, Document } from 'mongoose';

export interface ISetting extends Document {
  companyName?: string;
  domain?: string;
  email?: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  phoneNumber?: string;
  address?: string;
  logo?: string;
  favicon?: string;
  currencySymbol?: string;
  showBlog?: boolean;
}

const SettingSchema: Schema = new Schema(
  {
    companyName: { type: String },
    domain: { type: String },
    email: { type: String },
    bankName: { type: String },
    accountName: { type: String },
    accountNumber: { type: String },
    phoneNumber: { type: String },
    address: { type: String },
    logo: { type: String },
    favicon: { type: String },
    currencySymbol: { type: String, default: '₦' },
    showBlog: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ISetting>('Setting', SettingSchema);
