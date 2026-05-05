import mongoose, { Schema, Document } from 'mongoose';

export interface IWholesaleOrderItem {
  productId?: mongoose.Types.ObjectId;
  productName: string;
  productImage?: string;
  price: number;
  quantity: number;
}

export interface IWholesaleOrder extends Document {
  userId?: mongoose.Types.ObjectId;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  deliveryAddress?: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  notes?: string;
  receiptPath?: string;
  receiptNumber?: string;
  approvedBy?: string;
  paymentMethod: 'cash' | 'pos' | 'transfer' | 'online';
  items: IWholesaleOrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

const WholesaleOrderItemSchema: Schema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'WholesaleProduct' },
  productName: { type: String, required: true },
  productImage: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtuals for OrderItem
WholesaleOrderItemSchema.virtual('product_name').get(function() { return this.productName; });
WholesaleOrderItemSchema.virtual('product_image').get(function() { return this.productImage; });

const WholesaleOrderSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String },
    deliveryAddress: { type: String },
    totalAmount: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
    paymentStatus: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
    notes: { type: String },
    receiptPath: { type: String },
    receiptNumber: { type: String },
    approvedBy: { type: String },
    paymentMethod: { type: String, enum: ['cash', 'pos', 'transfer', 'online'], default: 'online' },
    items: [WholesaleOrderItemSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtuals for snake_case compatibility with frontend
WholesaleOrderSchema.virtual('customer_name').get(function() { return this.customerName; });
WholesaleOrderSchema.virtual('customer_email').get(function() { return this.customerEmail; });
WholesaleOrderSchema.virtual('customer_phone').get(function() { return this.customerPhone; });
WholesaleOrderSchema.virtual('delivery_address').get(function() { return this.deliveryAddress; });
WholesaleOrderSchema.virtual('total_amount').get(function() { return this.totalAmount; });
WholesaleOrderSchema.virtual('payment_status').get(function() { return this.paymentStatus; });
WholesaleOrderSchema.virtual('payment_method').get(function() { return this.paymentMethod; });
WholesaleOrderSchema.virtual('receipt_number').get(function() { return this.receiptNumber; });
WholesaleOrderSchema.virtual('receipt_path').get(function() { return this.receiptPath; });
WholesaleOrderSchema.virtual('approved_by').get(function() { return this.approvedBy; });
WholesaleOrderSchema.virtual('created_at').get(function() { return this.createdAt; });
WholesaleOrderSchema.virtual('updated_at').get(function() { return this.updatedAt; });

export default mongoose.model<IWholesaleOrder>('WholesaleOrder', WholesaleOrderSchema);
