const Order = require('../models/Order');
const Customer = require('../models/Customer');
const { Inventory } = require('../models/Inventory');
const Honey = require('../models/Honey');
const Supplier = require('../models/Supplier');

exports.getStats = async (req, res) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    const [
      totalCustomers, totalSuppliers, totalHoneys,
      todayRevenue, monthRevenue, lastMonthRevenue,
      pendingOrders, lowStockItems,
      topSelling, monthlyChart
    ] = await Promise.all([
      Customer.countDocuments({ isActive: true }),
      Supplier.countDocuments({ status: 'active' }),
      Honey.countDocuments({ isAvailable: true }),
      Order.aggregate([{ $match: { createdAt: { $gte: today }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }]),
      Order.aggregate([{ $match: { createdAt: { $gte: monthStart }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }]),
      Order.aggregate([{ $match: { createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.countDocuments({ status: { $in: ['pending', 'confirmed'] } }),
      Inventory.aggregate([{ $lookup: { from: 'inventories', localField: '_id', foreignField: 'honey', as: 'inv' } },
        { $addFields: { isLow: { $lte: ['$quantity', '$minQuantity'] } } },
        { $match: { isLow: true } }, { $count: 'count' }]),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $unwind: '$items' },
        { $group: { _id: '$items.honey', name: { $first: '$items.name' }, totalSold: { $sum: '$items.quantity' }, revenue: { $sum: '$items.total' } } },
        { $sort: { revenue: -1 } }, { $limit: 5 }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: new Date(today.getFullYear(), today.getMonth() - 5, 1) }, status: { $ne: 'cancelled' } } },
        { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$total' }, count: { $sum: 1 } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    ]);

    const lowStockCount = await Inventory.countDocuments({ $expr: { $lte: ['$quantity', '$minQuantity'] } });

    res.json({ success: true, data: {
      totalCustomers, totalSuppliers, totalHoneys,
      todayRevenue: todayRevenue[0]?.total || 0,
      todayOrders: todayRevenue[0]?.count || 0,
      monthRevenue: monthRevenue[0]?.total || 0,
      monthOrders: monthRevenue[0]?.count || 0,
      lastMonthRevenue: lastMonthRevenue[0]?.total || 0,
      pendingOrders, lowStockItems: lowStockCount,
      topSelling, monthlyChart
    }});
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
