const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  module: { type: String, enum: ['auth', 'honey', 'order', 'customer', 'supplier', 'inventory', 'quality', 'invoice', 'report', 'user'] },
  description: String,
  targetId: String,
  targetType: String,
  ipAddress: String,
  userAgent: String,
  changes: mongoose.Schema.Types.Mixed,
  status: { type: String, enum: ['success', 'failed'], default: 'success' }
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
