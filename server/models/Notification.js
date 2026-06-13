const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'warning', 'error', 'success'], default: 'info' },
  category: { type: String, enum: ['inventory', 'order', 'quality', 'system', 'payment'], default: 'system' },
  targetRole: { type: String, enum: ['all', 'admin', 'inventory_manager', 'sales_manager', 'supplier_manager', 'customer_service'] },
  targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isRead: { type: Boolean, default: false },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  link: String,
  data: mongoose.Schema.Types.Mixed
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
