require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Honey = require('../models/Honey');
const Supplier = require('../models/Supplier');
const Customer = require('../models/Customer');
const { Inventory } = require('../models/Inventory');
const Order = require('../models/Order');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/honey-store');
  console.log('Connected to DB');

  // Clear collections
  await Promise.all([User.deleteMany(), Honey.deleteMany(), Supplier.deleteMany(), Customer.deleteMany(), Inventory.deleteMany(), Order.deleteMany()]);

  // Users
  const users = await User.insertMany([
    { name: 'مدير النظام', email: 'admin@honey.com', password: await bcrypt.hash('admin123', 12), role: 'admin', phone: '0501234567' },
    { name: 'أحمد المخزن', email: 'inventory@honey.com', password: await bcrypt.hash('inv123', 12), role: 'inventory_manager', phone: '0502345678' },
    { name: 'سارة المبيعات', email: 'sales@honey.com', password: await bcrypt.hash('sales123', 12), role: 'sales_manager', phone: '0503456789' },
    { name: 'محمد الموردين', email: 'supplier@honey.com', password: await bcrypt.hash('sup123', 12), role: 'supplier_manager', phone: '0504567890' },
    { name: 'نورة الخدمة', email: 'service@honey.com', password: await bcrypt.hash('srv123', 12), role: 'customer_service', phone: '0505678901' }
  ]);

  // Suppliers
  const suppliers = await Supplier.insertMany([
    { name: 'عبدالله الزهراني', company: 'مناحل الزهراني', phone: '0551234567', email: 'zahrani@honey.sa', address: { city: 'عسير', region: 'المنطقة الجنوبية', country: 'السعودية' }, rating: 5, totalSupplied: 850, totalPaid: 42500 },
    { name: 'فهد العتيبي', company: 'مناحل نجد', phone: '0552345678', email: 'otaibi@honey.sa', address: { city: 'الرياض', region: 'نجد', country: 'السعودية' }, rating: 4, totalSupplied: 620, totalPaid: 28000 },
    { name: 'سعد القحطاني', company: 'مناحل تهامة', phone: '0553456789', address: { city: 'جازان', region: 'تهامة', country: 'السعودية' }, rating: 4, totalSupplied: 430, totalPaid: 18900 },
    { name: 'خالد الشهري', company: 'مناحل السروات', phone: '0554567890', address: { city: 'أبها', region: 'السروات', country: 'السعودية' }, rating: 5, totalSupplied: 1200, totalPaid: 85000 }
  ]);

  // Honey types
  const honeys = await Honey.insertMany([
    { name: 'عسل السدر الأصيل', nameEn: 'Sidr Honey', type: 'sidr', description: 'عسل السدر الطبيعي من جبال السروات', price: 450, costPrice: 280, sku: 'HNY-0001', origin: 'عسير - السعودية', quality: 'premium', productionDate: new Date('2024-03-01'), expiryDate: new Date('2026-03-01'), weight: 1, unit: 'kg', isAvailable: true, supplier: suppliers[0]._id },
    { name: 'عسل الأكاسيا', nameEn: 'Acacia Honey', type: 'acacia', description: 'عسل الأكاسيا الخفيف ذو اللون الذهبي', price: 280, costPrice: 160, sku: 'HNY-0002', origin: 'نجد - السعودية', quality: 'grade_a', productionDate: new Date('2024-04-01'), expiryDate: new Date('2026-04-01'), weight: 1, unit: 'kg', isAvailable: true, supplier: suppliers[1]._id },
    { name: 'عسل الزهور البري', nameEn: 'Wildflower Honey', type: 'flower', description: 'عسل متعدد الأزهار البرية', price: 180, costPrice: 90, sku: 'HNY-0003', origin: 'الباحة - السعودية', quality: 'grade_a', productionDate: new Date('2024-05-01'), expiryDate: new Date('2026-05-01'), weight: 1, unit: 'kg', isAvailable: true, supplier: suppliers[2]._id },
    { name: 'عسل الثيم الجبلي', nameEn: 'Mountain Thyme Honey', type: 'thyme', description: 'عسل الزعتر الجبلي العطري', price: 350, costPrice: 210, sku: 'HNY-0004', origin: 'جازان - السعودية', quality: 'premium', productionDate: new Date('2024-02-01'), expiryDate: new Date('2026-02-01'), weight: 1, unit: 'kg', isAvailable: true, supplier: suppliers[3]._id },
    { name: 'عسل المانوكا', nameEn: 'Manuka Honey', type: 'manuka', description: 'عسل المانوكا الطبي المستورد', price: 850, costPrice: 520, sku: 'HNY-0005', origin: 'نيوزيلندا', quality: 'premium', productionDate: new Date('2024-01-01'), expiryDate: new Date('2026-01-01'), weight: 0.5, unit: 'kg', isAvailable: true },
    { name: 'عسل البرسيم', nameEn: 'Clover Honey', type: 'clover', description: 'عسل البرسيم الحلو المعتدل', price: 150, costPrice: 75, sku: 'HNY-0006', origin: 'المدينة - السعودية', quality: 'standard', productionDate: new Date('2024-06-01'), expiryDate: new Date('2026-06-01'), weight: 1, unit: 'kg', isAvailable: true, supplier: suppliers[1]._id }
  ]);

  // Inventory
  const inventoryItems = [
    { honey: honeys[0]._id, quantity: 85, unit: 'kg', minQuantity: 10, maxQuantity: 200 },
    { honey: honeys[1]._id, quantity: 120, unit: 'kg', minQuantity: 15, maxQuantity: 300 },
    { honey: honeys[2]._id, quantity: 8, unit: 'kg', minQuantity: 10, maxQuantity: 200 },
    { honey: honeys[3]._id, quantity: 45, unit: 'kg', minQuantity: 10, maxQuantity: 150 },
    { honey: honeys[4]._id, quantity: 3, unit: 'kg', minQuantity: 5, maxQuantity: 50 },
    { honey: honeys[5]._id, quantity: 200, unit: 'kg', minQuantity: 20, maxQuantity: 400 }
  ];
  await Inventory.insertMany(inventoryItems);

  // Customers
  const customers = await Customer.insertMany([
    { name: 'محمد بن عبدالله', phone: '0561234567', email: 'mohammed@gmail.com', address: { city: 'الرياض', region: 'نجد', country: 'السعودية' }, customerType: 'vip', discount: 10, totalOrders: 24, totalSpent: 18600 },
    { name: 'فاطمة السالم', phone: '0562345678', address: { city: 'جدة', region: 'الحجاز', country: 'السعودية' }, customerType: 'wholesale', discount: 15, totalOrders: 12, totalSpent: 28000 },
    { name: 'أحمد الحربي', phone: '0563456789', address: { city: 'الدمام', region: 'الشرقية', country: 'السعودية' }, customerType: 'individual', totalOrders: 5, totalSpent: 2800 },
    { name: 'نورة العمري', phone: '0564567890', email: 'noura@gmail.com', address: { city: 'أبها', region: 'عسير', country: 'السعودية' }, customerType: 'individual', totalOrders: 8, totalSpent: 4200 },
    { name: 'شركة الشفاء للعسل', phone: '0114567890', address: { city: 'الرياض', region: 'نجد', country: 'السعودية' }, customerType: 'wholesale', discount: 20, totalOrders: 36, totalSpent: 95000 }
  ]);

  // Sample orders
  const orderData = [
    { customer: customers[0]._id, customerName: customers[0].name, customerPhone: customers[0].phone, items: [{ honey: honeys[0]._id, name: honeys[0].name, quantity: 2, weight: 2, unit: 'kg', unitPrice: 450, total: 900 }], status: 'delivered', paymentMethod: 'cash', paymentStatus: 'paid', subtotal: 900, discount: 90, tax: 0, total: 810, paidAmount: 810, createdBy: users[2]._id },
    { customer: customers[1]._id, customerName: customers[1].name, customerPhone: customers[1].phone, items: [{ honey: honeys[1]._id, name: honeys[1].name, quantity: 5, weight: 5, unit: 'kg', unitPrice: 280, total: 1400 }, { honey: honeys[2]._id, name: honeys[2].name, quantity: 3, weight: 3, unit: 'kg', unitPrice: 180, total: 540 }], status: 'preparing', paymentMethod: 'bank_transfer', paymentStatus: 'paid', subtotal: 1940, discount: 291, tax: 0, total: 1649, paidAmount: 1649, createdBy: users[2]._id },
    { customerName: 'زبون نقدي', customerPhone: '0500000000', items: [{ honey: honeys[3]._id, name: honeys[3].name, quantity: 1, weight: 1, unit: 'kg', unitPrice: 350, total: 350 }], status: 'pending', paymentMethod: 'cash', paymentStatus: 'pending', subtotal: 350, discount: 0, tax: 0, total: 350, paidAmount: 0, createdBy: users[4]._id },
    { customer: customers[4]._id, customerName: customers[4].name, customerPhone: customers[4].phone, items: [{ honey: honeys[0]._id, name: honeys[0].name, quantity: 10, weight: 10, unit: 'kg', unitPrice: 405, total: 4050 }, { honey: honeys[1]._id, name: honeys[1].name, quantity: 8, weight: 8, unit: 'kg', unitPrice: 238, total: 1904 }], status: 'confirmed', paymentMethod: 'bank_transfer', paymentStatus: 'partial', subtotal: 5954, discount: 0, tax: 0, total: 5954, paidAmount: 3000, createdBy: users[2]._id }
  ];

  for (const od of orderData) {
    const count = await Order.countDocuments();
    od.orderNumber = `ORD-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
    await Order.create(od);
  }

  console.log('✅ تم إدخال البيانات التجريبية بنجاح!');
  console.log('📧 بيانات الدخول:');
  console.log('   مدير النظام: admin@honey.com / admin123');
  console.log('   مسؤول المخزون: inventory@honey.com / inv123');
  console.log('   مسؤول المبيعات: sales@honey.com / sales123');
  await mongoose.disconnect();
};

seed().catch(err => { console.error(err); process.exit(1); });
