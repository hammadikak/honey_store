import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { usersAPI } from '../services/api'
import Modal from '../components/common/Modal'
import Table from '../components/common/Table'
import toast from 'react-hot-toast'
import { MdAdd, MdEdit, MdDelete, MdLock } from 'react-icons/md'
import { useAuth } from '../context/AuthContext'

const roleLabels = { admin:'مدير النظام', inventory_manager:'مسؤول المخزون', sales_manager:'مسؤول المبيعات', supplier_manager:'مسؤول الموردين', customer_service:'خدمة العملاء' }
const roleColors = { admin:'bg-red-100 text-red-700', inventory_manager:'bg-blue-100 text-blue-700', sales_manager:'bg-green-100 text-green-700', supplier_manager:'bg-purple-100 text-purple-700', customer_service:'bg-gray-100 text-gray-600' }

export default function UsersPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const { register, handleSubmit, reset, watch } = useForm()

  const load = async () => {
    setLoading(true)
    try { const res = await usersAPI.getAll(); setUsers(res.data) }
    catch { toast.error('فشل تحميل المستخدمين') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openEdit = (u) => { setEditing(u); reset({ name: u.name, email: u.email, role: u.role, phone: u.phone, isActive: u.isActive }); setModalOpen(true) }
  const openAdd = () => { setEditing(null); reset({}); setModalOpen(true) }

  const onSubmit = async (data) => {
    try {
      if (editing) { await usersAPI.update(editing._id, data); toast.success('تم تحديث بيانات الموظف') }
      else { await usersAPI.create(data); toast.success('تم إضافة الموظف') }
      setModalOpen(false); load()
    } catch (err) { toast.error(err.message || 'حدث خطأ') }
  }

  const handleDelete = async (id) => {
    try { await usersAPI.delete(id); toast.success('تم حذف الموظف'); setDeleteConfirm(null); load() }
    catch (err) { toast.error(err.message) }
  }

  const columns = [
    { key: 'name', label: 'الموظف', render: (v, r) => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-honey-100 dark:bg-honey-900/30 flex items-center justify-center font-bold text-honey-700 text-sm">{v?.charAt(0)}</div>
        <div>
          <p className="font-semibold text-sm">{v} {r._id === currentUser?._id && <span className="text-xs text-honey-600">(أنت)</span>}</p>
          <p className="text-xs text-gray-400">{r.email}</p>
        </div>
      </div>
    )},
    { key: 'phone', label: 'الهاتف', render: v => <span className="font-mono text-sm">{v || '—'}</span> },
    { key: 'role', label: 'الدور', render: v => <span className={`honey-badge ${roleColors[v]}`}>{roleLabels[v]}</span> },
    { key: 'isActive', label: 'الحالة', render: v => <span className={`honey-badge ${v ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{v ? 'نشط' : 'موقف'}</span> },
    { key: 'lastLogin', label: 'آخر دخول', render: v => <span className="text-xs text-gray-400">{v ? new Date(v).toLocaleDateString('ar-SA') : 'لم يسجل بعد'}</span> },
    { key: '_id', label: 'إجراءات', render: (v, row) => row._id !== currentUser?._id && (
      <div className="flex items-center gap-2">
        <button onClick={() => openEdit(row)} className="p-1.5 hover:bg-honey-50 dark:hover:bg-honey-900/20 text-honey-600 rounded-lg"><MdEdit size={18}/></button>
        <button onClick={() => setDeleteConfirm(row)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg"><MdDelete size={18}/></button>
      </div>
    )}
  ]

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <MdLock size={18} className="text-honey-600"/>
          <span>صلاحيات إدارة الموظفين - مقتصرة على المدير فقط</span>
        </div>
        <button onClick={openAdd} className="honey-btn-primary"><MdAdd size={20}/> إضافة موظف</button>
      </div>

      {/* Role Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {Object.entries(roleLabels).map(([role, label]) => (
          <motion.div key={role} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="honey-card p-3 text-center">
            <p className="text-2xl font-bold font-display text-gray-800 dark:text-white">
              {users.filter(u => u.role === role).length}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </motion.div>
        ))}
      </div>

      <div className="honey-card overflow-hidden">
        <Table columns={columns} data={users} loading={loading} emptyMessage="لا يوجد موظفون"/>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'} size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الاسم *</label><input {...register('name', {required:true})} className="honey-input" placeholder="اسم الموظف"/></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">البريد الإلكتروني *</label><input {...register('email', {required:true})} type="email" className="honey-input" placeholder="email@example.com"/></div>
            {!editing && <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">كلمة المرور *</label><input {...register('password', {required:!editing, minLength:6})} type="password" className="honey-input" placeholder="6 أحرف على الأقل"/></div>}
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الهاتف</label><input {...register('phone')} className="honey-input" placeholder="05xxxxxxxx"/></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الدور</label>
              <select {...register('role')} className="honey-input">
                {Object.entries(roleLabels).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input {...register('isActive')} type="checkbox" id="userActive" defaultChecked className="w-4 h-4 accent-honey-600"/>
            <label htmlFor="userActive" className="text-sm text-gray-700 dark:text-gray-300">حساب نشط</label>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="honey-btn-primary flex-1 justify-center">{editing ? 'حفظ التعديلات' : 'إضافة الموظف'}</button>
            <button type="button" onClick={() => setModalOpen(false)} className="honey-btn-secondary">إلغاء</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="تأكيد الحذف" size="sm">
        <div className="text-center space-y-4">
          <div className="text-5xl">⚠️</div>
          <p className="text-gray-700 dark:text-gray-300">حذف الموظف <strong>{deleteConfirm?.name}</strong>؟</p>
          <div className="flex gap-3">
            <button onClick={() => handleDelete(deleteConfirm._id)} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium">حذف</button>
            <button onClick={() => setDeleteConfirm(null)} className="flex-1 honey-btn-secondary justify-center">إلغاء</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
