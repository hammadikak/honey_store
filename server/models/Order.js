const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  honey: { type: mongoose.Schema.Types.ObjectId, ref: 'Honey', required: true },
  name: String,
  quantity: { type: Number, required: true, min: 1 },
  weight: Number,
  unit: String,
  unitPrice: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  customerName: String,
  customerPhone: String,
  items: [orderItemSchema],
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: { type: String, enum: ['cash', 'bank_transfer', 'credit_card', 'online'], default: 'cash' },
  paymentStatus: { type: String, enum: ['pending', 'partial', 'paid'], default: 'pending' },
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  notes: String,
  deliveryAddress: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  statusHistory: [{
    status: String,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    note: String
  }]
}, { timestamps: true });

orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
