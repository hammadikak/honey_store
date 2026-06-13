import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { reportsAPI } from '../services/api'
import toast from 'react-hot-toast'
import { MdCalendarToday, MdRefresh } from 'react-icons/md'

const monthNames = {1:'يناير',2:'فبراير',3:'مارس',4:'أبريل',5:'مايو',6:'يونيو',7:'يوليو',8:'أغسطس',9:'سبتمبر',10:'أكتوبر',11:'نوفمبر',12:'ديسمبر'}

export default function ReportsPage() {
  const [salesData, setSalesData] = useState([])
  const [inventoryData, setInventoryData] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  })
  const [groupBy, setGroupBy] = useState('month')

  const load = async () => {
    setLoading(true)
    try {
      const [salesRes, invRes] = await Promise.all([
        reportsAPI.getSales({ ...dateRange, groupBy }),
        reportsAPI.getInventory()
      ])
      setSalesData(salesRes.data); setInventoryData(invRes.data)
    } catch { toast.error('فشل تحميل التقارير') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [dateRange, groupBy])

  const chartData = salesData.map(d => ({
    name: groupBy === 'month' ? monthNames[d._id.month] : `${d._id.day}/${d._id.month}`,
    revenue: d.revenue || 0,
    orders: d.orders || 0,
    avgOrder: Math.round(d.avgOrder || 0)
  }))

  const totalRevenue = salesData.reduce((s, d) => s + (d.revenue || 0), 0)
  const totalOrders = salesData.reduce((s, d) => s + (d.orders || 0), 0)
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="honey-card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <MdCalendarToday className="text-honey-600" size={20}/>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">من</label>
            <input type="date" value={dateRange.from} onChange={e => setDateRange(p => ({...p, from: e.target.value}))} className="honey-input w-36 text-sm"/>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">إلى</label>
            <input type="date" value={dateRange.to} onChange={e => setDateRange(p => ({...p, to: e.target.value}))} className="honey-input w-36 text-sm"/>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">التجميع</label>
            <select value={groupBy} onChange={e => setGroupBy(e.target.value)} className="honey-input w-28 text-sm">
              <option value="day">يومي</option>
              <option value="month">شهري</option>
            </select>
          </div>
          <button onClick={load} className="honey-btn-secondary text-sm py-2"><MdRefresh size={18}/> تحديث</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'إجمالي الإيرادات', value: `${totalRevenue.toLocaleString()} ر.س`, icon: '💰', color: 'from-honey-500 to-honey-600' },
          { label: 'عدد الطلبات', value: totalOrders.toLocaleString(), icon: '📦', color: 'from-blue-500 to-blue-600' },
          { label: 'متوسط قيمة الطلب', value: `${avgOrderValue.toFixed(0)} ر.س`, icon: '📊', color: 'from-purple-500 to-purple-600' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="honey-card p-5 flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-3xl shadow-lg`}>{s.icon}</div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-0.5">{s.label}</p>
              <p className="text-2xl font-display font-bold text-gray-800 dark:text-white">{loading ? '...' : s.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="honey-card p-5">
        <h3 className="font-display font-bold text-gray-800 dark:text-white mb-4">تقرير الإيرادات</h3>
        {loading ? <div className="skeleton h-64 rounded-xl"/> : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d97706" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: 'Tajawal' }}/>
              <YAxis tick={{ fontSize: 11 }}/>
              <Tooltip formatter={(v, n) => [n === 'revenue' ? `${v.toLocaleString()} ر.س` : v, n === 'revenue' ? 'الإيرادات' : 'الطلبات']}/>
              <Area type="monotone" dataKey="revenue" stroke="#d97706" strokeWidth={2.5} fill="url(#revGrad)"/>
            </AreaChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Orders Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="honey-card p-5">
        <h3 className="font-display font-bold text-gray-800 dark:text-white mb-4">تقرير الطلبات</h3>
        {loading ? <div className="skeleton h-48 rounded-xl"/> : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: 'Tajawal' }}/>
              <YAxis tick={{ fontSize: 11 }}/>
              <Tooltip formatter={(v) => [v, 'عدد الطلبات']}/>
              <Bar dataKey="orders" fill="#b45309" radius={[6,6,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Inventory Report */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="honey-card p-5">
        <h3 className="font-display font-bold text-gray-800 dark:text-white mb-4">تقرير حركة المخزون</h3>
        {loading ? <div className="skeleton h-48 rounded-xl"/> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>{['نوع العسل','إجمالي الوارد (كغ)','إجمالي الصادر (كغ)','الفرق'].map(h =>
                  <th key={h} className="px-4 py-3 text-right text-xs text-gray-500 font-semibold">{h}</th>
                )}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {inventoryData.slice(0, 10).map((item, i) => (
                  <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3 font-medium">{item.honey?.name || '—'}</td>
                    <td className="px-4 py-3 text-green-600 font-semibold">+{item.totalIn || 0}</td>
                    <td className="px-4 py-3 text-red-500 font-semibold">-{item.totalOut || 0}</td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${(item.totalIn - item.totalOut) >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
                        {item.totalIn - item.totalOut}
                      </span>
                    </td>
                  </motion.tr>
                ))}
                {inventoryData.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-10 text-gray-400">لا توجد بيانات</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  )
}
