const ActivityLog = require('../models/ActivityLog');

const logActivity = (action, module, description = '') => async (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = async (data) => {
    if (req.user && data.success !== false) {
      await ActivityLog.create({
        user: req.user._id,
        action,
        module,
        description: description || action,
        targetId: req.params.id || data?.data?._id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        status: 'success'
      }).catch(console.error);
    }
    return originalJson(data);
  };
  next();
};

module.exports = logActivity;
