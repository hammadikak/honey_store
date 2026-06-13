const Customer = require('../models/Customer');
const Order = require('../models/Order');

exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, type } = req.query;
    const filter = {};
    if (search) filter.$or = [{ name: new RegExp(search, 'i') }, { phone: new RegExp(search, 'i') }];
    if (type) filter.customerType = type;
    const total = await Customer.countDocuments(filter);
    const data = await Customer.find(filter).sort('-createdAt').skip((page - 1) * limit).limit(Number(limit));
    res.json({ success: true, data, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: 'العميل غير موجود' });
    const orders = await Order.find({ customer: customer._id }).sort('-createdAt').limit(10);
    res.json({ success: true, data: { ...customer.toObject(), recentOrders: orders } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json({ success: true, data: customer, message: 'تم إضافة العميل بنجاح' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!customer) return res.status(404).json({ success: false, message: 'العميل غير موجود' });
    res.json({ success: true, data: customer, message: 'تم تحديث بيانات العميل' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'تم حذف العميل بنجاح' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
