const router = require('express').Router();
const c = require('../controllers/inventoryController');
const { protect, authorize } = require('../middlewares/auth');
router.use(protect);
router.get('/', c.getAll);
router.get('/movements', c.getMovements);
router.post('/adjust', authorize('admin', 'inventory_manager'), c.adjust);
module.exports = router;
