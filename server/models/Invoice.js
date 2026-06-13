const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, unique: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  issueDate: { type: Date, default: Date.now },
  dueDate: Date,
  items: [{
    name: String,
    sku: String,
    quantity: Number,
    unitPrice: Number,
    discount: Number,
    total: Number
  }],
  subtotal: Number,
  discountAmount: Number,
  taxRate: { type: Number, default: 15 },
  taxAmount: Number,
  shippingCost: { type: Number, default: 0 },
  total: Number,
  paidAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled'], default: 'draft' },
  paymentMethod: String,
  notes: String,
  qrCode: String,
  pdfUrl: String,
}, { timestamps: true });

invoiceSchema.pre('save', async function(next) {
  if (!this.invoiceNumber) {
    const count = await mongoose.model('Invoice').countDocuments();
    const date = new Date();
    this.invoiceNumber = `INV-${date.getFullYear()}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);
