import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { suppliersAPI } from '../services/api'
import Modal from '../components/common/Modal'
import Table from '../components/common/Table'
import Pagination from '../components/common/Pagination'
import toast from 'react-hot-toast'
import { MdAdd, MdSearch, MdEdit, MdDelete, MdStar } from 'react-icons/md'
import { useAuth } from '../context/AuthContext'

const statusLabels = { active: 'نشط', inactive: 'غير نشط', suspended: 'موقف' }
const statusColors = { active: 'bg-green-100 text-green-700', inactive: 'bg-gray-100 text-gray-600', suspended: 'bg-red-100 text-red-600' }

export default function SupplierList() {
  const { hasRole } = useAuth()
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [search, setSearch] = useState('')
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const { register, handleSubmit, reset } = useForm()
  const canEdit = hasRole('admin', 'supplier_manager')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await suppliersAPI.getAll({ search, page: pagination.page, limit: 15 })
      setSuppliers(res.data); setPagination(res.pagination)
    } catch { toast.error('فشل تحميل الموردين') }
    finally { setLoading(false) }
  }, [search, pagination.page])

  useEffect(() => { load() }, [load])

  const openEdit = (s) => { setEditing(s); reset({ ...s, 'address.city': s.address?.city, 'address.country': s.address?.country }); setModalOpen(true) }
  const openAdd = () => { setEditing(null); reset({}); setModalOpen(true) }

  const onSubmit = async (data) => {
    const payload = { ...data, address: { city: data['address.city'], country: data['address.country'] || 'السعودية', region: data['address.region'] } }
    try {
      if (editing) { await suppliersAPI.update(editing._id, payload); toast.success('تم تحديث المورد') }
      else { await suppliersAPI.create(payload); toast.success('تم إضافة المورد') }
      setModalOpen(false); load()
    } catch (err) { toast.error(err.message || 'حدث خطأ') }
  }

  const handleDelete = async (id) => {
    try { await suppliersAPI.delete(id); toast.success('تم حذف المورد'); setDeleteConfirm(null); load() }
    catch (err) { toast.error(err.message) }
  }

  const StarRating = ({ rating }) => (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => <MdStar key={s} size={14} className={s <= rating ? 'text-yellow-400' : 'text-gray-300'}/>)}
    </div>
  )

  const columns = [
    { key: 'name', label: 'المورد', render: (v, r) => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-honey-100 dark:bg-honey-900/30 flex items-center justify-center font-bold text-honey-700 dark:text-honey-400 text-sm">{v?.charAt(0)}</div>
        <div><p className="font-semibold text-sm">{v}</p><p className="text-xs text-gray-400">{r.company || '—'}</p></div>
      </div>
    )},
    { key: 'phone', label: 'الهاتف', render: v => <span className="font-mono text-sm">{v}</span> },
    { key: 'address', label: 'الموقع', render: v => <span className="text-sm text-gray-600 dark:text-gray-400">{v?.city || '—'}</span> },
    { key: 'rating', label: 'التقييم', render: v => <StarRating rating={v}/> },
    { key: 'status', label: 'الحالة', render: v => <span className={`honey-badge ${statusColors[v]}`}>{statusLabels[v]}</span> },
    { key: 'totalSupplied', label: 'الكمية المورّدة', render: v => <span className="font-semibold">{(v||0).toLocaleString()} كغ</span> },
    { key: 'totalPaid', label: 'المبالغ المدفوعة', render: v => <span className="font-bold text-honey-600">{(v||0).toLocaleString()} ر.س</span> },
    { key: '_id', label: 'إجراءات', render: (v, row) => canEdit && (
      <div className="flex items-center gap-2">
        <button onClick={() => openEdit(row)} className="p-1.5 hover:bg-honey-50 dark:hover:bg-honey-900/20 text-honey-600 rounded-lg"><MdEdit size={18}/></button>
        {hasRole('admin') && <button onClick={() => setDeleteConfirm(row)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg"><MdDelete size={18}/></button>}
      </div>
    )}
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <MdSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث عن مورد..." className="honey-input pr-10"/>
        </div>
        {canEdit && <button onClick={openAdd} className="honey-btn-primary"><MdAdd size={20}/> إضافة مورد</button>}
      </div>

      <div className="honey-card overflow-hidden">
        <Table columns={columns} data={suppliers} loading={loading} emptyMessage="لا يوجد موردين"/>
        <Pagination {...pagination} onPageChange={p => setPagination(prev => ({...prev, page: p}))}/>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'تعديل المورد' : 'إضافة مورد جديد'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الاسم *</label><input {...register('name', {required:true})} className="honey-input" placeholder="اسم المورد"/></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الشركة</label><input {...register('company')} className="honey-input" placeholder="اسم الشركة"/></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الهاتف *</label><input {...register('phone', {required:true})} className="honey-input" placeholder="05xxxxxxxx"/></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">البريد الإلكتروني</label><input {...register('email')} type="email" className="honey-input"/></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المدينة</label><input {...register('address.city')} className="honey-input" placeholder="الرياض"/></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المنطقة</label><input {...register('address.region')} className="honey-input" placeholder="نجد"/></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">التقييم</label>
              <select {...register('rating', {valueAsNumber:true})} className="honey-input">
                {[5,4,3,2,1].map(r => <option key={r} value={r}>{'⭐'.repeat(r)} ({r}/5)</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الحالة</label>
              <select {...register('status')} className="honey-input">
                {Object.entries(statusLabels).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ملاحظات</label><textarea {...register('notes')} rows={2} className="honey-input resize-none"/></div>
          <div className="flex gap-3"><button type="submit" className="honey-btn-primary flex-1 justify-center">{editing ? 'حفظ' : 'إضافة'}</button><button type="button" onClick={() => setModalOpen(false)} className="honey-btn-secondary">إلغاء</button></div>
        </form>
      </Modal>

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="تأكيد الحذف" size="sm">
        <div className="text-center space-y-4">
          <div className="text-5xl">⚠️</div>
          <p className="text-gray-700 dark:text-gray-300">حذف المورد <strong>{deleteConfirm?.name}</strong>؟</p>
          <div className="flex gap-3">
            <button onClick={() => handleDelete(deleteConfirm._id)} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium">حذف</button>
            <button onClick={() => setDeleteConfirm(null)} className="flex-1 honey-btn-secondary justify-center">إلغاء</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
