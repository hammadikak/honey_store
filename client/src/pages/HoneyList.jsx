import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { honeyAPI } from '../services/api'
import Modal from '../components/common/Modal'
import Table from '../components/common/Table'
import Pagination from '../components/common/Pagination'
import toast from 'react-hot-toast'
import { MdAdd, MdEdit, MdDelete, MdSearch, MdFilterList } from 'react-icons/md'
import { useAuth } from '../context/AuthContext'

const honeyTypes = { sidr:'سدر', acacia:'أكاسيا', flower:'زهور', thyme:'زعتر', mountain:'جبلي', manuka:'مانوكا', clover:'برسيم', other:'أخرى' }
const qualityLabels = { premium:'ممتاز', grade_a:'درجة أولى', grade_b:'درجة ثانية', standard:'عادي' }
const qualityColors = { premium:'text-purple-600 bg-purple-50', grade_a:'text-blue-600 bg-blue-50', grade_b:'text-green-600 bg-green-50', standard:'text-gray-600 bg-gray-50' }

export default function HoneyList() {
  const { hasRole } = useAuth()
  const [honeys, setHoneys] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await honeyAPI.getAll({ search, type: typeFilter, page: pagination.page, limit: 12 })
      setHoneys(res.data)
      setPagination(res.pagination)
    } catch { toast.error('فشل تحميل البيانات') }
    finally { setLoading(false) }
  }, [search, typeFilter, pagination.page])

  useEffect(() => { load() }, [load])

  const openAdd = () => { setEditing(null); reset({}); setModalOpen(true) }
  const openEdit = (h) => { setEditing(h); reset({ ...h, supplier: h.supplier?._id }); setModalOpen(true) }

  const onSubmit = async (data) => {
    const fd = new FormData()
    Object.entries(data).forEach(([k, v]) => { if (v !== undefined && v !== '') fd.append(k, v) })
    if (data.imageFile?.[0]) fd.append('image', data.imageFile[0])
    try {
      if (editing) { await honeyAPI.update(editing._id, fd); toast.success('تم تحديث العسل') }
      else { await honeyAPI.create(fd); toast.success('تم إضافة العسل') }
      setModalOpen(false); load()
    } catch (err) { toast.error(err.message || 'حدث خطأ') }
  }

  const handleDelete = async (id) => {
    try {
      await honeyAPI.delete(id)
      toast.success('تم حذف العسل')
      setDeleteConfirm(null); load()
    } catch (err) { toast.error(err.message || 'فشل الحذف') }
  }

  const canEdit = hasRole('admin', 'inventory_manager')

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1 max-w-xl">
          <div className="relative flex-1">
            <MdSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث عن عسل..."
              className="honey-input pr-10" />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="honey-input w-36">
            <option value="">كل الأنواع</option>
            {Object.entries(honeyTypes).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        {canEdit && (
          <button onClick={openAdd} className="honey-btn-primary">
            <MdAdd size={20} /> إضافة عسل
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-60 rounded-2xl" />)}
        </div>
      ) : honeys.length === 0 ? (
        <div className="text-center py-16 text-gray-400"><div className="text-5xl mb-3">🍯</div><p>لا توجد أنواع عسل</p></div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {honeys.map((honey, i) => (
            <motion.div key={honey._id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="honey-card overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <div className="aspect-square bg-honey-50 dark:bg-gray-700 relative overflow-hidden">
                {honey.image ? (
                  <img src={honey.image} alt={honey.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl">🍯</div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`honey-badge text-xs ${qualityColors[honey.quality] || 'bg-gray-100 text-gray-600'}`}>
                    {qualityLabels[honey.quality]}
                  </span>
                </div>
                {!honey.isAvailable && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-sm font-bold bg-red-500 px-3 py-1 rounded-full">غير متوفر</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-gray-800 dark:text-white text-sm line-clamp-1">{honey.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{honeyTypes[honey.type]} • {honey.origin || '—'}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold text-honey-600 text-sm">{honey.price} ر.س/{honey.unit}</span>
                  <span className={`text-xs ${honey.stockQuantity <= 5 ? 'text-red-500' : 'text-green-600'}`}>
                    {honey.stockQuantity} {honey.unit}
                  </span>
                </div>
                {canEdit && (
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => openEdit(honey)}
                      className="flex-1 py-1.5 text-xs bg-honey-50 dark:bg-honey-900/20 hover:bg-honey-100 text-honey-700 dark:text-honey-400 rounded-lg transition-all flex items-center justify-center gap-1">
                      <MdEdit size={14} /> تعديل
                    </button>
                    <button onClick={() => setDeleteConfirm(honey)}
                      className="py-1.5 px-2 text-xs bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all">
                      <MdDelete size={14} />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Pagination {...pagination} onPageChange={p => setPagination(prev => ({ ...prev, page: p }))} />

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'تعديل العسل' : 'إضافة عسل جديد'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم العسل *</label>
              <input {...register('name', { required: true })} className="honey-input" placeholder="عسل السدر" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">النوع *</label>
              <select {...register('type', { required: true })} className="honey-input">
                {Object.entries(honeyTypes).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">السعر (ر.س) *</label>
              <input {...register('price', { required: true, valueAsNumber: true })} type="number" className="honey-input" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">سعر التكلفة (ر.س)</label>
              <input {...register('costPrice', { valueAsNumber: true })} type="number" className="honey-input" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الجودة</label>
              <select {...register('quality')} className="honey-input">
                {Object.entries(qualityLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">بلد المنشأ</label>
              <input {...register('origin')} className="honey-input" placeholder="السعودية" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الوزن</label>
              <input {...register('weight', { valueAsNumber: true })} type="number" step="0.1" className="honey-input" placeholder="1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الوحدة</label>
              <select {...register('unit')} className="honey-input">
                <option value="kg">كيلو</option>
                <option value="g">غرام</option>
                <option value="liter">لتر</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تاريخ الإنتاج</label>
              <input {...register('productionDate')} type="date" className="honey-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تاريخ الانتهاء</label>
              <input {...register('expiryDate')} type="date" className="honey-input" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الوصف</label>
            <textarea {...register('description')} rows={3} className="honey-input resize-none" placeholder="وصف العسل..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">صورة العسل</label>
            <input {...register('imageFile')} type="file" accept="image/*" className="honey-input" />
          </div>
          <div className="flex items-center gap-2">
            <input {...register('isAvailable')} type="checkbox" id="available" className="w-4 h-4 accent-honey-600" defaultChecked />
            <label htmlFor="available" className="text-sm text-gray-700 dark:text-gray-300">متوفر للبيع</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="honey-btn-primary flex-1 justify-center">
              {editing ? 'حفظ التعديلات' : 'إضافة العسل'}
            </button>
            <button type="button" onClick={() => setModalOpen(false)} className="honey-btn-secondary">إلغاء</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="تأكيد الحذف" size="sm">
        <div className="text-center space-y-4">
          <div className="text-5xl">⚠️</div>
          <p className="text-gray-700 dark:text-gray-300">هل تريد حذف <strong>{deleteConfirm?.name}</strong>؟</p>
          <p className="text-sm text-red-500">لا يمكن التراجع عن هذا الإجراء</p>
          <div className="flex gap-3">
            <button onClick={() => handleDelete(deleteConfirm._id)} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all">حذف</button>
            <button onClick={() => setDeleteConfirm(null)} className="flex-1 honey-btn-secondary justify-center">إلغاء</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
