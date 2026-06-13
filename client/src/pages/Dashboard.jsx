import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { dashboardAPI } from '../services/api'
import StatCard from '../components/common/StatCard'
import toast from 'react-hot-toast'

const monthNames = { 1:'يناير',2:'فبراير',3:'مارس',4:'أبريل',5:'مايو',6:'يونيو',7:'يوليو',8:'أغسطس',9:'سبتمبر',10:'أكتوبر',11:'نوفمبر',12:'ديسمبر' }

const COLORS = ['#d97706','#b45309','#f59e0b','#fbbf24','#fde68a']

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardAPI.getStats()
      .then(res => setStats(res.data))
      .catch(() => toast.error('فشل تحميل البيانات'))
      .finally(() => setLoading(false))
  }, [])

  const monthlyData = stats?.monthlyChart?.map(m => ({
    name: monthNames[m._id.month],
    revenue: m.revenue,
    orders: m.count
  })) || []

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
      </div>
    </div>
  )

  const revenueGrowth = stats?.lastMonthRevenue > 0
    ? Math.round(((stats.monthRevenue - stats.lastMonthRevenue) / stats.lastMonthRevenue) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard index={0} icon="💰" title="إيرادات اليوم" value={`${(stats?.todayRevenue || 0).toLocaleString()} ر.س`} subtitle={`${stats?.todayOrders || 0} طلب اليوم`} color="honey" />
        <StatCard index={1} icon="📊" title="إيرادات الشهر" value={`${(stats?.monthRevenue || 0).toLocaleString()} ر.س`} subtitle={`${stats?.monthOrders || 0} طلب هذا الشهر`} trend={revenueGrowth} color="green" />
        <StatCard index={2} icon="👥" title="العملاء" value={stats?.totalCustomers || 0} color="blue" />
        <StatCard index={3} icon="🚚" title="الموردين" value={stats?.totalSuppliers || 0} color="purple" />
        <StatCard index={4} icon="⏳" title="طلبات معلقة" value={stats?.pendingOrders || 0} subtitle="تحتاج متابعة" color="honey" />
        <StatCard index={5} icon="🍯" title="أنواع العسل" value={stats?.totalHoneys || 0} subtitle="متوفرة للبيع" color="teal" />
        <StatCard index={6} icon="⚠️" title="نقص المخزون" value={stats?.lowStockItems || 0} subtitle="منتج بحاجة تجديد" color="red" />
        <StatCard index={7} icon="📦" title="الطلبات الكلية" value={(stats?.monthOrders || 0)} subtitle="هذا الشهر" color="blue" />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="honey-card p-5 lg:col-span-2">
          <h3 className="font-display font-bold text-gray-800 dark:text-white mb-4">الإيرادات الشهرية</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: 'Tajawal' }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(val) => [`${val.toLocaleString()} ر.س`, 'الإيرادات']} />
              <Line type="monotone" dataKey="revenue" stroke="#d97706" strokeWidth={2.5} dot={{ fill: '#d97706', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Selling */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="honey-card p-5">
          <h3 className="font-display font-bold text-gray-800 dark:text-white mb-4">أفضل أنواع العسل مبيعاً</h3>
          {stats?.topSelling?.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={stats.topSelling} dataKey="revenue" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={35}>
                    {stats.topSelling.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(val) => [`${val.toLocaleString()} ر.س`]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {stats.topSelling.slice(0, 4).map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                      <span className="text-gray-600 dark:text-gray-400 truncate max-w-[120px]">{item.name || 'عسل'}</span>
                    </div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{item.revenue?.toLocaleString()} ر.س</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center text-gray-400 py-10">لا توجد مبيعات بعد</div>
          )}
        </motion.div>
      </div>

      {/* Orders Bar Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="honey-card p-5">
        <h3 className="font-display font-bold text-gray-800 dark:text-white mb-4">عدد الطلبات الشهرية</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: 'Tajawal' }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(val) => [val, 'طلبات']} />
            <Bar dataKey="orders" fill="#d97706" radius={[6,6,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Low Stock Alert */}
      {stats?.lowStockItems > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="honey-card p-4 border-r-4 border-orange-500 bg-orange-50 dark:bg-orange-900/10">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-semibold text-orange-800 dark:text-orange-400">تنبيه نقص المخزون</p>
              <p className="text-sm text-orange-600 dark:text-orange-500">{stats.lowStockItems} منتج وصل لمستوى المخزون المنخفض - يرجى المراجعة</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
