const router = require('express').Router();
const QualityCheck = require('../models/QualityCheck');
const { protect } = require('../middlewares/auth');
router.use(protect);
router.get('/', async (req, res) => {
  const data = await QualityCheck.find().populate('honey', 'name sku').populate('supplier', 'name').sort('-createdAt').limit(50);
  res.json({ success: true, data });
});
router.post('/', async (req, res) => {
  try {
    req.body.inspector = req.user._id;
    req.body.inspectorName = req.user.name;
    const check = await QualityCheck.create(req.body);
    res.status(201).json({ success: true, data: check });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});
module.exports = router;
