const Order = require('../models/Order');
const { InventoryMovement } = require('../models/Inventory');
const SupplyRecord = require('../models/SupplyRecord');

exports.salesReport = async (req, res) => {
  try {
    const { from, to, groupBy = 'day' } = req.query;
    const matchFilter = { status: { $ne: 'cancelled' } };
    if (from || to) {
      matchFilter.createdAt = {};
      if (from) matchFilter.createdAt.$gte = new Date(from);
      if (to) matchFilter.createdAt.$lte = new Date(to + 'T23:59:59');
    }
    const groupId = groupBy === 'month'
      ? { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }
      : { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };
    const data = await Order.aggregate([
      { $match: matchFilter },
      { $group: { _id: groupId, revenue: { $sum: '$total' }, orders: { $sum: 1 }, avgOrder: { $avg: '$total' } } },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.inventoryReport = async (req, res) => {
  try {
    const movements = await InventoryMovement.aggregate([
      { $group: { _id: '$honey', totalIn: { $sum: { $cond: [{ $eq: ['$type', 'in'] }, '$quantity', 0] } }, totalOut: { $sum: { $cond: [{ $eq: ['$type', 'out'] }, '$quantity', 0] } } } },
      { $lookup: { from: 'honeys', localField: '_id', foreignField: '_id', as: 'honey' } },
      { $unwind: '$honey' }
    ]);
    res.json({ success: true, data: movements });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
