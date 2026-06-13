const router = require('express').Router();
const { getStats } = require('../controllers/dashboardController');
const { protect } = require('../middlewares/auth');
router.get('/stats', protect, getStats);
module.exports = router;
