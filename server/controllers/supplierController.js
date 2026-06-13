const Supplier = require('../models/Supplier');
const SupplyRecord = require('../models/SupplyRecord');

exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const filter = {};
    if (search) filter.$or = [{ name: new RegExp(search, 'i') }, { phone: new RegExp(search, 'i') }];
    if (status) filter.status = status;
    const total = await Supplier.countDocuments(filter);
    const data = await Supplier.find(filter).sort('-createdAt').skip((page - 1) * limit).limit(Number(limit));
    res.json({ success: true, data, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ success: false, message: 'المورد غير موجود' });
    const records = await SupplyRecord.find({ supplier: supplier._id })
      .populate('honey', 'name sku').sort('-createdAt').limit(10);
    res.json({ success: true, data: { ...supplier.toObject(), recentSupplies: records } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json({ success: true, data: supplier, message: 'تم إضافة المورد بنجاح' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!supplier) return res.status(404).json({ success: false, message: 'المورد غير موجود' });
    res.json({ success: true, data: supplier, message: 'تم تحديث المورد بنجاح' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await Supplier.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'تم حذف المورد بنجاح' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
