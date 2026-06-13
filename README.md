# 🍯 نظام إدارة متجر العسل

نظام إدارة داخلي متكامل لمتجر بيع العسل، يشمل إدارة المخزون والطلبات والعملاء والموردين وفحص الجودة والتقارير.

## 🚀 متطلبات التشغيل

- Node.js v18+
- MongoDB (محلي أو Atlas)
- npm أو yarn

## 📁 هيكل المشروع

```
honey-store/
├── client/          # React + Vite (Frontend)
│   └── src/
│       ├── components/   # المكونات المشتركة
│       ├── context/      # Context API
│       ├── pages/        # الصفحات
│       └── services/     # خدمات API
└── server/          # Node.js + Express (Backend)
    ├── controllers/ # منطق التحكم
    ├── models/      # نماذج قاعدة البيانات
    ├── routes/      # مسارات API
    ├── middlewares/ # الوسطاء
    ├── config/      # الإعدادات
    └── utils/       # الأدوات المساعدة
```

## ⚙️ التثبيت والتشغيل

### 1. إعداد الخادم (Backend)

```bash
cd server
npm install
cp .env.example .env
# عدّل ملف .env وأضف بيانات اتصال MongoDB
npm run seed     # إدخال بيانات تجريبية
npm run dev      # تشغيل الخادم
```

### 2. إعداد الواجهة (Frontend)

```bash
cd client
npm install
npm run dev
```

### 3. فتح النظام

افتح المتصفح على: `http://localhost:5173`

## 🔐 بيانات الدخول التجريبية

| الدور | البريد | كلمة المرور |
|-------|--------|-------------|
| مدير النظام | admin@honey.com | admin123 |
| مسؤول المخزون | inventory@honey.com | inv123 |
| مسؤول المبيعات | sales@honey.com | sales123 |
| مسؤول الموردين | supplier@honey.com | sup123 |
| خدمة العملاء | service@honey.com | srv123 |

## 🌟 المميزات

### الوحدات الرئيسية
- **لوحة التحكم**: إحصائيات شاملة، رسوم بيانية تفاعلية، تنبيهات المخزون
- **إدارة العسل**: إضافة/تعديل/حذف أنواع العسل مع الصور والبيانات التفصيلية
- **إدارة الطلبات**: استلام وتتبع الطلبات، طباعة الفواتير، تحديث الحالة
- **إدارة العملاء**: بيانات العملاء، سجل المشتريات، نظام الخصومات
- **إدارة الموردين**: بيانات الموردين، تقييمات، سجل التوريد
- **إدارة المخزون**: تتبع الكميات، تنبيهات النقص، سجل الحركات
- **فحص الجودة**: تسجيل نتائج الفحص، القبول/الرفض، نسب الجودة
- **التقارير**: تقارير المبيعات والمخزون، رسوم بيانية قابلة للتخصيص
- **إدارة الموظفين**: إدارة المستخدمين والأدوار والصلاحيات

### التقنيات المستخدمة
- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, Recharts
- **Backend**: Node.js, Express.js, JWT, bcrypt, Multer
- **Database**: MongoDB, Mongoose
- **Architecture**: MVC, REST API, Context API

## 📡 API Endpoints

| Method | Endpoint | الوصف |
|--------|----------|-------|
| POST | /api/auth/login | تسجيل الدخول |
| GET | /api/honey | جلب أنواع العسل |
| POST | /api/orders | إنشاء طلب |
| GET | /api/dashboard/stats | إحصائيات لوحة التحكم |
| GET | /api/reports/sales | تقرير المبيعات |

## 🔧 متغيرات البيئة

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/honey-store
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```
"# honey_store" 
