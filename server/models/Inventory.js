const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  honey: { type: mongoose.Schema.Types.ObjectId, ref: 'Honey', required: true, unique: true },
  quantity: { type: Number, default: 0, min: 0 },
  unit: { type: String, enum: ['kg', 'g', 'liter', 'ml'], default: 'kg' },
  minQuantity: { type: Number, default: 5 },
  maxQuantity: { type: Number, default: 500 },
  location: { type: String, default: 'المستودع الرئيسي' },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

const movementSchema = new mongoose.Schema({
  honey: { type: mongoose.Schema.Types.ObjectId, ref: 'Honey', required: true },
  type: { type: String, enum: ['in', 'out', 'adjustment', 'return'], required: true },
  quantity: { type: Number, required: true },
  previousQuantity: { type: Number },
  newQuantity: { type: Number },
  reason: { type: String },
  reference: { type: String },
  referenceModel: { type: String, enum: ['Order', 'SupplyRecord', 'Adjustment'] },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: String
}, { timestamps: true });

module.exports = {
  Inventory: mongoose.model('Inventory', inventorySchema),
  InventoryMovement: mongoose.model('InventoryMovement', movementSchema)
};
