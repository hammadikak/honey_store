const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'اسم المورد مطلوب'], trim: true },
  company: { type: String },
  phone: { type: String, required: [true, 'رقم الهاتف مطلوب'] },
  email: { type: String },
  address: {
    city: String,
    region: String,
    country: { type: String, default: 'السعودية' },
    details: String
  },
  rating: { type: Number, min: 1, max: 5, default: 3 },
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  bankInfo: { bankName: String, accountNumber: String, iban: String },
  notes: { type: String },
  totalSupplied: { type: Number, default: 0 },
  totalPaid: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Supplier', supplierSchema);
