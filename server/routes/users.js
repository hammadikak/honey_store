const router = require('express').Router();
const User = require('../models/User');
const { protect, authorize } = require('../middlewares/auth');
router.use(protect);
router.get('/', authorize('admin'), async (req, res) => {
  const users = await User.find();
  res.json({ success: true, data: users });
});
router.post('/', authorize('admin'), async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});
router.put('/:id', authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: user });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'تم حذف المستخدم' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
module.exports = router;
