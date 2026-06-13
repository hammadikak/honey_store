const router = require('express').Router();
const c = require('../controllers/reportsController');
const { protect } = require('../middlewares/auth');
router.use(protect);
router.get('/sales', c.salesReport);
router.get('/inventory', c.inventoryReport);
module.exports = router;
