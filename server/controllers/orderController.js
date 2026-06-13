const Order = require('../models/Order');
const { Inventory, InventoryMovement } = require('../models/Inventory');
const Customer = require('../models/Customer');

exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, paymentStatus, search, from, to } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (search) filter.$or = [
      { orderNumber: new RegExp(search, 'i') },
      { customerName: new RegExp(search, 'i') },
      { customerPhone: new RegExp(search, 'i') }
    ];
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to + 'T23:59:59');
    }
    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate('customer', 'name phone')
      .populate('createdBy', 'name')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, data: orders, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer')
      .populate('items.honey', 'name image sku')
      .populate('createdBy', 'name');
    if (!order) return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    // Check inventory
    for (const item of req.body.items) {
      const inv = await Inventory.findOne({ honey: item.honey });
      if (!inv || inv.quantity < item.quantity) {
        return res.status(400).json({ success: false, message: `الكمية غير كافية لأحد المنتجات` });
      }
    }
    req.body.createdBy = req.user._id;
    const order = await Order.create(req.body);

    // Deduct from inventory
    for (const item of order.items) {
      const inv = await Inventory.findOne({ honey: item.honey });
      const prev = inv.quantity;
      inv.quantity -= item.quantity;
      inv.lastUpdated = new Date();
      await inv.save();
      await InventoryMovement.create({
        honey: item.honey, type: 'out', quantity: item.quantity,
        previousQuantity: prev, newQuantity: inv.quantity,
        reason: 'بيع', reference: order.orderNumber, referenceModel: 'Order',
        performedBy: req.user._id
      });
    }

    // Update customer stats
    if (order.customer) {
      await Customer.findByIdAndUpdate(order.customer, {
        $inc: { totalOrders: 1, totalSpent: order.total }
      });
    }
    res.status(201).json({ success: true, data: order, message: 'تم إنشاء الطلب بنجاح' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
    order.status = status;
    order.statusHistory.push({ status, changedBy: req.user._id, note });
    await order.save();
    res.json({ success: true, data: order, message: 'تم تحديث حالة الطلب' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const [todayOrders, monthOrders, statusStats] = await Promise.all([
      Order.aggregate([{ $match: { createdAt: { $gte: today }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$total' } } }]),
      Order.aggregate([{ $match: { createdAt: { $gte: monthStart }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$total' } } }]),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
    ]);
    res.json({ success: true, data: {
      today: todayOrders[0] || { count: 0, revenue: 0 },
      month: monthOrders[0] || { count: 0, revenue: 0 },
      byStatus: statusStats
    }});
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
