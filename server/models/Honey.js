const mongoose = require('mongoose');

const honeySchema = new mongoose.Schema({
  name: { type: String, required: [true, 'اسم العسل مطلوب'], trim: true },
  nameEn: { type: String, trim: true },
  type: {
    type: String,
    enum: ['sidr', 'acacia', 'flower', 'thyme', 'mountain', 'manuka', 'clover', 'other'],
    required: true
  },
  description: { type: String },
  price: { type: Number, required: [true, 'السعر مطلوب'], min: 0 },
  costPrice: { type: Number, min: 0 },
  image: { type: String },
  sku: { type: String, unique: true },
  barcode: { type: String, unique: true, sparse: true },
  origin: { type: String },
  quality: { type: String, enum: ['premium', 'grade_a', 'grade_b', 'standard'], default: 'standard' },
  productionDate: { type: Date },
  expiryDate: { type: Date },
  weight: { type: Number },
  unit: { type: String, enum: ['kg', 'g', 'liter', 'ml'], default: 'kg' },
  isAvailable: { type: Boolean, default: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  tags: [String],
  nutritionInfo: {
    calories: Number,
    sugar: Number,
    moisture: Number
  }
}, { timestamps: true });

honeySchema.virtual('stockInfo', {
  ref: 'Inventory',
  localField: '_id',
  foreignField: 'honey',
  justOne: true
});

module.exports = mongoose.model('Honey', honeySchema);
