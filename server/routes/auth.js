const router = require('express').Router();
const { login, getMe, updatePassword } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/password', protect, updatePassword);
module.exports = router;
