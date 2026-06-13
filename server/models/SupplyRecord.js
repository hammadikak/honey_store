const mongoose = require('mongoose');

const supplyRecordSchema = new mongoose.Schema({
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  honey: { type: mongoose.Schema.Types.ObjectId, ref: 'Honey', required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, default: 'kg' },
  pricePerUnit: { type: Number, required: true },
  totalCost: { type: Number, required: true },
  supplyDate: { type: Date, default: Date.now },
  invoiceNumber: String,
  qualityCheck: { type: mongoose.Schema.Types.ObjectId, ref: 'QualityCheck' },
  status: { type: String, enum: ['pending', 'received', 'quality_check', 'accepted', 'rejected'], default: 'pending' },
  notes: String,
  receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('SupplyRecord', supplyRecordSchema);
