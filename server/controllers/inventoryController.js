const { Inventory, InventoryMovement } = require('../models/Inventory');
const Honey = require('../models/Honey');

exports.getAll = async (req, res) => {
  try {
    const { lowStock } = req.query;
    let query = Inventory.find().populate('honey', 'name image sku type price unit');
    if (lowStock === 'true') {
      const items = await Inventory.find().populate('honey', 'name image sku type price unit');
      const low = items.filter(i => i.quantity <= i.minQuantity);
      return res.json({ success: true, data: low });
    }
    const data = await query;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.adjust = async (req, res) => {
  try {
    const { honeyId, type, quantity, reason, notes } = req.body;
    const inv = await Inventory.findOne({ honey: honeyId });
    if (!inv) return res.status(404).json({ success: false, message: 'المنتج غير موجود في المخزون' });
    const prev = inv.quantity;
    if (type === 'in') inv.quantity += quantity;
    else if (type === 'out') {
      if (inv.quantity < quantity) return res.status(400).json({ success: false, message: 'الكمية غير كافية' });
      inv.quantity -= quantity;
    } else if (type === 'adjustment') inv.quantity = quantity;
    inv.lastUpdated = new Date();
    await inv.save();
    await InventoryMovement.create({
      honey: honeyId, type, quantity, previousQuantity: prev,
      newQuantity: inv.quantity, reason, notes, performedBy: req.user._id
    });
    res.json({ success: true, data: inv, message: 'تم تحديث المخزون بنجاح' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getMovements = async (req, res) => {
  try {
    const { honeyId, type, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (honeyId) filter.honey = honeyId;
    if (type) filter.type = type;
    const total = await InventoryMovement.countDocuments(filter);
    const movements = await InventoryMovement.find(filter)
      .populate('honey', 'name sku')
      .populate('performedBy', 'name')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, data: movements, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
