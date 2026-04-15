import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  productId?: mongoose.Types.ObjectId;
  productName: string;
  productImage?: string;
  price: number;
  quantity: number;
}

export interface IOrder extends Document {
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
  items: IOrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema: Schema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product' },
  productName: { type: String, required: true },
  productImage: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
});

const OrderSchema: Schema = new Schema(
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
    items: [OrderItemSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtuals for snake_case compatibility with frontend
OrderSchema.virtual('customer_name').get(function() { return this.customerName; });
OrderSchema.virtual('customer_email').get(function() { return this.customerEmail; });
OrderSchema.virtual('customer_phone').get(function() { return this.customerPhone; });
OrderSchema.virtual('delivery_address').get(function() { return this.deliveryAddress; });
OrderSchema.virtual('total_amount').get(function() { return this.totalAmount; });
OrderSchema.virtual('payment_status').get(function() { return this.paymentStatus; });
OrderSchema.virtual('payment_method').get(function() { return this.paymentMethod; });
OrderSchema.virtual('receipt_number').get(function() { return this.receiptNumber; });
OrderSchema.virtual('receipt_path').get(function() { return this.receiptPath; });
OrderSchema.virtual('approved_by').get(function() { return this.approvedBy; });
OrderSchema.virtual('created_at').get(function() { return this.createdAt; });
OrderSchema.virtual('updated_at').get(function() { return this.updatedAt; });

export default mongoose.model<IOrder>('Order', OrderSchema);
