import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { inventoryAPI } from '../services/api'
import Modal from '../components/common/Modal'
import Table from '../components/common/Table'
import toast from 'react-hot-toast'
import { MdAdd, MdRemove, MdHistory, MdSearch, MdWarning } from 'react-icons/md'
import { useAuth } from '../context/AuthContext'

const movTypeLabels = { in: 'إضافة', out: 'سحب', adjustment: 'تعديل', return: 'مرتجع' }
const movTypeColors = { in: 'bg-green-100 text-green-700', out: 'bg-red-100 text-red-600', adjustment: 'bg-blue-100 text-blue-700', return: 'bg-yellow-100 text-yellow-700' }

export default function InventoryPage() {
  const { hasRole } = useAuth()
  const [inventory, setInventory] = useState([])
  const [movements, setMovements] = useState([])
  const [loading, setLoading] = useState(true)
  const [adjustModal, setAdjustModal] = useState(null)
  const [historyModal, setHistoryModal] = useState(false)
  const [movLoading, setMovLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [adjustForm, setAdjustForm] = useState({ type: 'in', quantity: 1, reason: '' })
  const canAdjust = hasRole('admin', 'inventory_manager')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await inventoryAPI.getAll()
      setInventory(res.data)
    } catch { toast.error('فشل تحميل المخزون') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const loadMovements = async () => {
    setMovLoading(true)
    try {
      const res = await inventoryAPI.getMovements({ limit: 100 })
      setMovements(res.data)
    } catch { toast.error('فشل تحميل السجل') }
    finally { setMovLoading(false) }
  }

  const openHistory = () => { setHistoryModal(true); loadMovements() }

  const handleAdjust = async (e) => {
    e.preventDefault()
    try {
      await inventoryAPI.adjust({ honeyId: adjustModal.honey._id, ...adjustForm, quantity: Number(adjustForm.quantity) })
      toast.success('تم تحديث المخزون')
      setAdjustModal(null); load()
    } catch (err) { toast.error(err.message || 'فشل التحديث') }
  }

  const filtered = inventory.filter(i => !search || i.honey?.name?.toLowerCase().includes(search.toLowerCase()) || i.honey?.sku?.toLowerCase().includes(search.toLowerCase()))
  const lowStock = inventory.filter(i => i.quantity <= i.minQuantity)

  return (
    <div className="space-y-5">
      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="honey-card p-4 bg-orange-50 dark:bg-orange-900/10 border-r-4 border-orange-500">
          <div className="flex items-center gap-3">
            <MdWarning className="text-orange-500 flex-shrink-0" size={24}/>
            <div>
              <p className="font-semibold text-orange-800 dark:text-orange-400">تنبيه: مخزون منخفض</p>
              <p className="text-sm text-orange-600 dark:text-orange-500">{lowStock.length} منتج بحاجة تجديد: {lowStock.map(i => i.honey?.name).join(' • ')}</p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <MdSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث في المخزون..." className="honey-input pr-10"/>
        </div>
        <button onClick={openHistory} className="honey-btn-secondary"><MdHistory size={20}/> سجل الحركات</button>
      </div>

      {/* Inventory Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_,i) => <div key={i} className="skeleton h-36 rounded-2xl"/>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item, i) => {
            const pct = Math.min((item.quantity / item.maxQuantity) * 100, 100)
            const isLow = item.quantity <= item.minQuantity
            const isEmpty = item.quantity === 0
            return (
              <motion.div key={item._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`honey-card p-5 ${isLow ? 'border-orange-300 dark:border-orange-700' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {item.honey?.image
                      ? <img src={item.honey.image} className="w-12 h-12 rounded-xl object-cover" alt={item.honey?.name}/>
                      : <div className="w-12 h-12 rounded-xl bg-honey-100 dark:bg-honey-900/30 flex items-center justify-center text-2xl">🍯</div>
                    }
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-white text-sm line-clamp-1">{item.honey?.name}</p>
                      <p className="text-xs text-gray-400">{item.honey?.sku}</p>
                    </div>
                  </div>
                  {isLow && <span className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 px-2 py-0.5 rounded-full font-medium">منخفض</span>}
                  {isEmpty && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">نفد</span>}
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500 dark:text-gray-400">الكمية المتاحة</span>
                    <span className={`font-bold ${isEmpty ? 'text-red-500' : isLow ? 'text-orange-500' : 'text-gray-800 dark:text-white'}`}>
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${isEmpty ? 'bg-red-500' : isLow ? 'bg-orange-400' : 'bg-honey-500'}`}
                      style={{ width: `${pct}%` }}/>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>الحد الأدنى: {item.minQuantity}</span>
                    <span>الأقصى: {item.maxQuantity}</span>
                  </div>
                </div>

                {canAdjust && (
                  <div className="flex gap-2">
                    <button onClick={() => { setAdjustModal(item); setAdjustForm({ type: 'in', quantity: 1, reason: '' }) }}
                      className="flex-1 py-1.5 text-xs bg-green-50 dark:bg-green-900/20 hover:bg-green-100 text-green-700 dark:text-green-400 rounded-lg transition-all flex items-center justify-center gap-1">
                      <MdAdd size={14}/> إضافة
                    </button>
                    <button onClick={() => { setAdjustModal(item); setAdjustForm({ type: 'out', quantity: 1, reason: '' }) }}
                      className="flex-1 py-1.5 text-xs bg-red-50 dark:bg-red-900/20 hover:bg-red-100 text-red-600 dark:text-red-400 rounded-lg transition-all flex items-center justify-center gap-1">
                      <MdRemove size={14}/> سحب
                    </button>
                    <button onClick={() => { setAdjustModal(item); setAdjustForm({ type: 'adjustment', quantity: item.quantity, reason: '' }) }}
                      className="py-1.5 px-2 text-xs bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 text-blue-600 dark:text-blue-400 rounded-lg transition-all">
                      تعديل
                    </button>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Adjust Modal */}
      <Modal open={!!adjustModal} onClose={() => setAdjustModal(null)} title={`تعديل مخزون: ${adjustModal?.honey?.name}`} size="sm">
        {adjustModal && (
          <form onSubmit={handleAdjust} className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3 text-sm">
              <p className="text-gray-500 mb-1">الكمية الحالية</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{adjustModal.quantity} <span className="text-sm font-normal text-gray-500">{adjustModal.unit}</span></p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نوع العملية</label>
              <select value={adjustForm.type} onChange={e => setAdjustForm(p => ({...p, type: e.target.value}))} className="honey-input">
                <option value="in">إضافة للمخزون</option>
                <option value="out">سحب من المخزون</option>
                <option value="adjustment">تعديل مباشر</option>
                <option value="return">مرتجع</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {adjustForm.type === 'adjustment' ? 'الكمية الجديدة' : 'الكمية'} ({adjustModal.unit})
              </label>
              <input type="number" min="0" value={adjustForm.quantity}
                onChange={e => setAdjustForm(p => ({...p, quantity: e.target.value}))}
                className="honey-input text-lg font-bold"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">السبب</label>
              <input value={adjustForm.reason} onChange={e => setAdjustForm(p => ({...p, reason: e.target.value}))}
                className="honey-input" placeholder="سبب التعديل..."/>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="honey-btn-primary flex-1 justify-center">تأكيد</button>
              <button type="button" onClick={() => setAdjustModal(null)} className="honey-btn-secondary">إلغاء</button>
            </div>
          </form>
        )}
      </Modal>

      {/* Movements Modal */}
      <Modal open={historyModal} onClose={() => setHistoryModal(false)} title="سجل حركة المخزون" size="xl">
        {movLoading ? (
          <div className="space-y-2">{[...Array(8)].map((_,i) => <div key={i} className="skeleton h-12 rounded-xl"/>)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>{['المنتج','النوع','الكمية','قبل','بعد','السبب','المنفذ','التاريخ'].map(h =>
                  <th key={h} className="px-3 py-2.5 text-right text-xs text-gray-500 font-semibold">{h}</th>
                )}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {movements.map((m, i) => (
                  <motion.tr key={m._id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-3 py-2 font-medium text-xs">{m.honey?.name || '—'}</td>
                    <td className="px-3 py-2"><span className={`honey-badge text-xs ${movTypeColors[m.type]}`}>{movTypeLabels[m.type]}</span></td>
                    <td className={`px-3 py-2 font-bold ${m.type==='in'||m.type==='return'?'text-green-600':'text-red-500'}`}>
                      {m.type==='in'||m.type==='return'?'+':'-'}{m.quantity}
                    </td>
                    <td className="px-3 py-2 text-gray-500 text-xs">{m.previousQuantity ?? '—'}</td>
                    <td className="px-3 py-2 text-gray-800 dark:text-white text-xs font-medium">{m.newQuantity ?? '—'}</td>
                    <td className="px-3 py-2 text-gray-500 text-xs max-w-[100px] truncate">{m.reason || '—'}</td>
                    <td className="px-3 py-2 text-gray-500 text-xs">{m.performedBy?.name || '—'}</td>
                    <td className="px-3 py-2 text-gray-400 text-xs">{new Date(m.createdAt).toLocaleDateString('ar-SA')}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {movements.length === 0 && <div className="text-center py-10 text-gray-400">لا توجد حركات مخزون</div>}
          </div>
        )}
      </Modal>
    </div>
  )
}
