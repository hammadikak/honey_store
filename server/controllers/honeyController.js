const Honey = require('../models/Honey');
const { Inventory } = require('../models/Inventory');

exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, type, quality, isAvailable } = req.query;
    const filter = {};
    if (search) filter.$or = [{ name: new RegExp(search, 'i') }, { sku: new RegExp(search, 'i') }];
    if (type) filter.type = type;
    if (quality) filter.quality = quality;
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';

    const total = await Honey.countDocuments(filter);
    const honeys = await Honey.find(filter)
      .populate('supplier', 'name phone')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // attach stock info
    const honeyIds = honeys.map(h => h._id);
    const stocks = await Inventory.find({ honey: { $in: honeyIds } });
    const stockMap = {};
    stocks.forEach(s => { stockMap[s.honey.toString()] = s.quantity; });
    const data = honeys.map(h => ({
      ...h.toObject(),
      stockQuantity: stockMap[h._id.toString()] || 0
    }));

    res.json({ success: true, data, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const honey = await Honey.findById(req.params.id).populate('supplier', 'name phone email');
    if (!honey) return res.status(404).json({ success: false, message: 'العسل غير موجود' });
    const stock = await Inventory.findOne({ honey: honey._id });
    res.json({ success: true, data: { ...honey.toObject(), stockQuantity: stock?.quantity || 0 } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const count = await Honey.countDocuments();
    req.body.sku = req.body.sku || `HNY-${String(count + 1).padStart(4, '0')}`;
    if (req.file) req.body.image = `/uploads/honey/${req.file.filename}`;
    const honey = await Honey.create(req.body);
    await Inventory.create({ honey: honey._id, quantity: 0, unit: honey.unit || 'kg' });
    res.status(201).json({ success: true, data: honey, message: 'تم إضافة العسل بنجاح' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    if (req.file) req.body.image = `/uploads/honey/${req.file.filename}`;
    const honey = await Honey.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!honey) return res.status(404).json({ success: false, message: 'العسل غير موجود' });
    res.json({ success: true, data: honey, message: 'تم تحديث العسل بنجاح' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const honey = await Honey.findByIdAndDelete(req.params.id);
    if (!honey) return res.status(404).json({ success: false, message: 'العسل غير موجود' });
    await Inventory.deleteOne({ honey: req.params.id });
    res.json({ success: true, message: 'تم حذف العسل بنجاح' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
