const Order = require('../models/Order');
const Honey = require('../models/Honey');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');
const InventoryLog = require('../models/InventoryLog');

exports.getDashboard = async (req, res) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    const [todayOrders, monthOrders, lastMonthOrders, totalCustomers, totalHoney, lowStockItems, pendingOrders] = await Promise.all([
      Order.aggregate([{ $match: { createdAt: { $gte: today }, status: { $ne: 'cancelled' } } }, { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }]),
      Order.aggregate([{ $match: { createdAt: { $gte: monthStart }, status: { $ne: 'cancelled' } } }, { $group: { _id: null, revenue: { $sum: '$total' }, count: { $sum: 1 } } }]),
      Order.aggregate([{ $match: { createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd }, status: { $ne: 'cancelled' } } }, { $group: { _id: null, revenue: { $sum: '$total' } } }]),
      Customer.countDocuments({ isActive: true }),
      Honey.aggregate([{ $group: { _id: null, totalQty: { $sum: '$quantity' }, totalValue: { $sum: { $multiply: ['$quantity', '$costPrice'] } } } }]),
      Honey.countDocuments({ $expr: { $lte: ['$quantity', '$minQuantity'] } }),
      Order.countDocuments({ status: { $in: ['pending', 'processing'] } })
    ]);

    // Monthly revenue for chart (last 6 months)
    const monthlyRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: new Date(today.getFullYear(), today.getMonth() - 5, 1) }, status: { $ne: 'cancelled' } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Top selling honey
    const topHoney = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      { $group: { _id: '$items.honey', name: { $first: '$items.name' }, totalSold: { $sum: '$items.quantity' }, revenue: { $sum: '$items.total' } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);

    // Order status distribution
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        today: { orders: todayOrders[0]?.count || 0, revenue: todayOrders[0]?.total || 0 },
        thisMonth: { orders: monthOrders[0]?.count || 0, revenue: monthOrders[0]?.revenue || 0 },
        lastMonth: { revenue: lastMonthOrders[0]?.revenue || 0 },
        totalCustomers,
        inventory: { totalQuantity: totalHoney[0]?.totalQty || 0, totalValue: totalHoney[0]?.totalValue || 0 },
        lowStockItems,
        pendingOrders,
        monthlyRevenue,
        topHoney,
        ordersByStatus
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate ? new Date(endDate) : new Date();

    const groupFormat = groupBy === 'month' ? { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }
      : groupBy === 'week' ? { year: { $year: '$createdAt' }, week: { $week: '$createdAt' } }
      : { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };

    const sales = await Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end }, status: { $ne: 'cancelled' } } },
      { $group: { _id: groupFormat, revenue: { $sum: '$total' }, orders: { $sum: 1 }, avgOrderValue: { $avg: '$total' } } },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    const summary = await Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end }, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' }, totalOrders: { $sum: 1 }, totalTax: { $sum: '$taxAmount' }, totalDiscount: { $sum: '$discountAmount' } } }
    ]);

    res.json({ success: true, data: { sales, summary: summary[0] || {} } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getInventoryReport = async (req, res) => {
  try {
    const inventory = await Honey.find().populate('supplier', 'name').select('name sku category quantity minQuantity price costPrice expiryDate isAvailable quality');
    const logs = await InventoryLog.find().populate('honey', 'name sku').populate('performedBy', 'name').sort('-createdAt').limit(100);
    
    const summary = { totalProducts: inventory.length, lowStock: inventory.filter(h => h.quantity <= h.minQuantity).length, totalValue: inventory.reduce((sum, h) => sum + h.quantity * h.costPrice, 0), outOfStock: inventory.filter(h => h.quantity === 0).length };
    
    res.json({ success: true, data: { inventory, logs, summary } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
