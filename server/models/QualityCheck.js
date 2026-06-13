const mongoose = require('mongoose');

const qualityCheckSchema = new mongoose.Schema({
  honey: { type: mongoose.Schema.Types.ObjectId, ref: 'Honey', required: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  batchNumber: { type: String },
  checkDate: { type: Date, default: Date.now },
  inspector: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  inspectorName: String,
  result: { type: String, enum: ['passed', 'failed', 'conditional'], required: true },
  qualityScore: { type: Number, min: 0, max: 100 },
  parameters: {
    moisture: { value: Number, status: String },
    color: { value: String, status: String },
    taste: { value: String, status: String },
    smell: { value: String, status: String },
    density: { value: Number, status: String },
    purity: { value: Number, status: String }
  },
  quantity: { type: Number },
  acceptedQuantity: { type: Number },
  rejectedQuantity: { type: Number },
  notes: { type: String },
  images: [String]
}, { timestamps: true });

module.exports = mongoose.model('QualityCheck', qualityCheckSchema);
