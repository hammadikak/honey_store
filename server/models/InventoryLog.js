const mongoose = require('mongoose');

const inventoryLogSchema = new mongoose.Schema({
  honey: { type: mongoose.Schema.Types.ObjectId, ref: 'Honey', required: true },
  type: { type: String, enum: ['in', 'out', 'adjustment', 'return', 'damage'], required: true },
  quantity: { type: Number, required: true },
  previousQuantity: Number,
  newQuantity: Number,
  reason: String,
  reference: String,
  referenceType: { type: String, enum: ['order', 'supply', 'adjustment', 'damage', 'return'] },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: String,
  unitCost: Number,
}, { timestamps: true });

module.exports = mongoose.model('InventoryLog', inventoryLogSchema);
