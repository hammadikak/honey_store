import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { customersAPI } from '../services/api'
import Modal from '../components/common/Modal'
import Table from '../components/common/Table'
import Pagination from '../components/common/Pagination'
import toast from 'react-hot-toast'
import { MdAdd, MdSearch, MdEdit, MdDelete, MdPhone, MdEmail } from 'react-icons/md'
import { useAuth } from '../context/AuthContext'

const typeLabels = { individual: 'أفراد', wholesale: 'جملة', vip: 'VIP' }
const typeColors = { individual: 'bg-gray-100 text-gray-700', wholesale: 'bg-blue-100 text-blue-700', vip: 'bg-purple-100 text-purple-700' }

export default function CustomerList() {
  const { hasRole } = useAuth()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const { register, handleSubmit, reset } = useForm()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await customersAPI.getAll({ search, type: typeFilter, page: pagination.page, limit: 15 })
      setCustomers(res.data); setPagination(res.pagination)
    } catch { toast.error('فشل تحميل العملاء') }
    finally { setLoading(false) }
  }, [search, typeFilter, pagination.page])

  useEffect(() => { load() }, [load])

  const openEdit = (c) => { setEditing(c); reset(c); setModalOpen(true) }
  const openAdd = () => { setEditing(null); reset({}); setModalOpen(true) }

  const onSubmit = async (data) => {
    try {
      if (editing) { await customersAPI.update(editing._id, data); toast.success('تم تحديث بيانات العميل') }
      else { await customersAPI.create(data); toast.success('تم إضافة العميل') }
      setModalOpen(false); load()
    } catch (err) { toast.error(err.message || 'حدث خطأ') }
  }

  const handleDelete = async (id) => {
    try { await customersAPI.delete(id); toast.success('تم حذف العميل'); setDeleteConfirm(null); load() }
    catch (err) { toast.error(err.message) }
  }

  const columns = [
    { key: 'name', label: 'الاسم', render: (v, r) => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-honey-100 dark:bg-honey-900/30 flex items-center justify-center font-bold text-honey-700 dark:text-honey-400">{v?.charAt(0)}</div>
        <div><p className="font-semibold text-sm">{v}</p><p className="text-xs text-gray-400">{r.address?.city || '—'}</p></div>
      </div>
    )},
    { key: 'phone', label: 'الهاتف', render: v => <span className="font-mono text-sm">{v}</span> },
    { key: 'customerType', label: 'النوع', render: v => <span className={`honey-badge ${typeColors[v]}`}>{typeLabels[v]}</span> },
    { key: 'totalOrders', label: 'الطلبات', render: v => <span className="font-bold text-gray-800 dark:text-white">{v || 0}</span> },
    { key: 'totalSpent', label: 'إجمالي المشتريات', render: v => <span className="font-bold text-honey-600">{(v || 0).toLocaleString()} ر.س</span> },
    { key: 'discount', label: 'الخصم', render: v => v > 0 ? <span className="text-green-600 font-medium">{v}%</span> : <span className="text-gray-400">—</span> },
    { key: '_id', label: 'إجراءات', render: (v, row) => (
      <div className="flex items-center gap-2">
        <button onClick={() => openEdit(row)} className="p-1.5 hover:bg-honey-50 dark:hover:bg-honey-900/20 text-honey-600 rounded-lg"><MdEdit size={18}/></button>
        {hasRole('admin') && <button onClick={() => setDeleteConfirm(row)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg"><MdDelete size={18}/></button>}
      </div>
    )}
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1 max-w-xl">
          <div className="relative flex-1">
            <MdSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالاسم أو الهاتف..." className="honey-input pr-10"/>
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="honey-input w-32">
            <option value="">الكل</option>
            {Object.entries(typeLabels).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <button onClick={openAdd} className="honey-btn-primary"><MdAdd size={20}/> إضافة عميل</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'إجمالي العملاء', value: pagination.total, icon: '👥' },
          { label: 'عملاء VIP', value: customers.filter(c => c.customerType === 'vip').length, icon: '⭐' },
          { label: 'عملاء الجملة', value: customers.filter(c => c.customerType === 'wholesale').length, icon: '📦' }
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="honey-card p-4 flex items-center gap-3">
            <span className="text-2xl">{s.icon}</span>
            <div><p className="text-2xl font-bold font-display text-gray-800 dark:text-white">{s.value}</p><p className="text-xs text-gray-500">{s.label}</p></div>
          </motion.div>
        ))}
      </div>

      <div className="honey-card overflow-hidden">
        <Table columns={columns} data={customers} loading={loading} emptyMessage="لا يوجد عملاء"/>
        <Pagination {...pagination} onPageChange={p => setPagination(prev => ({...prev, page: p}))}/>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الاسم *</label><input {...register('name', {required:true})} className="honey-input" placeholder="اسم العميل"/></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الهاتف *</label><input {...register('phone', {required:true})} className="honey-input" placeholder="05xxxxxxxx"/></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">البريد الإلكتروني</label><input {...register('email')} type="email" className="honey-input" placeholder="email@example.com"/></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نوع العميل</label>
              <select {...register('customerType')} className="honey-input">
                {Object.entries(typeLabels).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المدينة</label><input {...register('address.city')} className="honey-input" placeholder="الرياض"/></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نسبة الخصم (%)</label><input {...register('discount', {valueAsNumber:true, min:0, max:100})} type="number" className="honey-input" defaultValue={0}/></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ملاحظات</label><textarea {...register('notes')} rows={2} className="honey-input resize-none" placeholder="أي ملاحظات..."/></div>
          <div className="flex gap-3"><button type="submit" className="honey-btn-primary flex-1 justify-center">{editing ? 'حفظ' : 'إضافة'}</button><button type="button" onClick={() => setModalOpen(false)} className="honey-btn-secondary">إلغاء</button></div>
        </form>
      </Modal>

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="تأكيد الحذف" size="sm">
        <div className="text-center space-y-4">
          <div className="text-5xl">⚠️</div>
          <p className="text-gray-700 dark:text-gray-300">حذف العميل <strong>{deleteConfirm?.name}</strong>؟</p>
          <div className="flex gap-3">
            <button onClick={() => handleDelete(deleteConfirm._id)} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all">حذف</button>
            <button onClick={() => setDeleteConfirm(null)} className="flex-1 honey-btn-secondary justify-center">إلغاء</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
