const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'الاسم مطلوب'], trim: true },
  email: { type: String, required: [true, 'البريد الإلكتروني مطلوب'], unique: true, lowercase: true },
  password: { type: String, required: [true, 'كلمة المرور مطلوبة'], minlength: 6, select: false },
  role: {
    type: String,
    enum: ['admin', 'inventory_manager', 'sales_manager', 'supplier_manager', 'customer_service'],
    default: 'customer_service'
  },
  phone: { type: String },
  avatar: { type: String },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
