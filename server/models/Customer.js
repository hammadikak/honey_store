const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'اسم العميل مطلوب'], trim: true },
  phone: { type: String, required: [true, 'رقم الهاتف مطلوب'] },
  email: { type: String },
  address: {
    city: String,
    region: String,
    country: { type: String, default: 'السعودية' },
    details: String
  },
  customerType: { type: String, enum: ['individual', 'wholesale', 'vip'], default: 'individual' },
  discount: { type: Number, default: 0, min: 0, max: 100 },
  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  notes: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
