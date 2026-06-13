import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useForm, useFieldArray } from 'react-hook-form'
import { ordersAPI, honeyAPI, customersAPI } from '../services/api'
import Modal from '../components/common/Modal'
import Table from '../components/common/Table'
import Pagination from '../components/common/Pagination'
import toast from 'react-hot-toast'
import { MdAdd, MdSearch, MdVisibility, MdEdit, MdPrint } from 'react-icons/md'

const statusLabels = { pending:'معلق', confirmed:'مؤكد', preparing:'جاري التجهيز', ready:'جاهز', delivered:'مسلّم', cancelled:'ملغي' }
const statusClasses = { pending:'status-pending', confirmed:'status-confirmed', preparing:'status-preparing', ready:'status-ready', delivered:'status-delivered', cancelled:'status-cancelled' }
const paymentLabels = { cash:'نقدي', bank_transfer:'تحويل بنكي', credit_card:'بطاقة ائتمان', online:'دفع إلكتروني' }
const paymentStatusLabels = { pending:'غير مدفوع', partial:'مدفوع جزئياً', paid:'مدفوع' }

export default function OrderList() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [viewModal, setViewModal] = useState(null)
  const [statusModal, setStatusModal] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [honeys, setHoneys] = useState([])
  const [customers, setCustomers] = useState([])
  const { register, handleSubmit, control, watch, reset, setValue } = useForm({
    defaultValues: { items: [{ honey: '', quantity: 1, unitPrice: 0, discount: 0, total: 0 }] }
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'items' })
  const watchItems = watch('items')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await ordersAPI.getAll({ search, status: statusFilter, page: pagination.page, limit: 15 })
      setOrders(res.data); setPagination(res.pagination)
    } catch { toast.error('فشل تحميل الطلبات') }
    finally { setLoading(false) }
  }, [search, statusFilter, pagination.page])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    honeyAPI.getAll({ limit: 100 }).then(r => setHoneys(r.data)).catch(() => {})
    customersAPI.getAll({ limit: 100 }).then(r => setCustomers(r.data)).catch(() => {})
  }, [])

  const calcSubtotal = () => watchItems.reduce((s, item) => {
    const qty = Number(item.quantity) || 0
    const price = Number(item.unitPrice) || 0
    const disc = Number(item.discount) || 0
    return s + (qty * price * (1 - disc/100))
  }, 0)

  const onHoneySelect = (idx, honeyId) => {
    const h = honeys.find(x => x._id === honeyId)
    if (h) { setValue(`items.${idx}.unitPrice`, h.price); setValue(`items.${idx}.name`, h.name) }
  }

  const onSubmit = async (data) => {
    const items = data.items.map(item => {
      const qty = Number(item.quantity); const price = Number(item.unitPrice); const disc = Number(item.discount || 0)
      return { ...item, quantity: qty, unitPrice: price, discount: disc, total: qty * price * (1 - disc/100), name: honeys.find(h => h._id === item.honey)?.name || '' }
    })
    const subtotal = items.reduce((s, i) => s + i.total, 0)
    const discount = Number(data.orderDiscount || 0)
    const tax = Number(data.tax || 0)
    const total = subtotal * (1 - discount/100) * (1 + tax/100)
    const payload = { ...data, items, subtotal, discount: subtotal * discount/100, tax: total * tax/100, total, paidAmount: data.paymentStatus === 'paid' ? total : Number(data.paidAmount || 0) }
    if (data.customer) { const c = customers.find(x => x._id === data.customer); if(c) { payload.customerName = c.name; payload.customerPhone = c.phone } }
    try {
      await ordersAPI.create(payload)
      toast.success('تم إنشاء الطلب بنجاح'); setModalOpen(false); reset(); load()
    } catch (err) { toast.error(err.message || 'فشل إنشاء الطلب') }
  }

  const handleStatusUpdate = async (data) => {
    try {
      await ordersAPI.updateStatus(statusModal._id, data)
      toast.success('تم تحديث الحالة'); setStatusModal(null); load()
    } catch (err) { toast.error(err.message) }
  }

  const printInvoice = (order) => {
    const w = window.open('', '_blank')
    w.document.write(`<html dir="rtl"><head><meta charset="UTF-8"><title>فاتورة ${order.orderNumber}</title>
    <style>body{font-family:Tajawal,Arial;padding:20px;direction:rtl} h1{color:#d97706} table{width:100%;border-collapse:collapse} th,td{border:1px solid #ddd;padding:8px;text-align:right} th{background:#f5f5f5} .total{font-size:1.2em;font-weight:bold;color:#d97706} @media print{button{display:none}}</style></head>
    <body><h1>🍯 فاتورة - ${order.orderNumber}</h1>
    <p><strong>العميل:</strong> ${order.customerName || '—'} | <strong>الهاتف:</strong> ${order.customerPhone || '—'}</p>
    <p><strong>التاريخ:</strong> ${new Date(order.createdAt).toLocaleDateString('ar-SA')}</p>
    <table><tr><th>المنتج</th><th>الكمية</th><th>السعر</th><th>المجموع</th></tr>
    ${order.items.map(i => `<tr><td>${i.name}</td><td>${i.quantity}</td><td>${i.unitPrice} ر.س</td><td>${i.total?.toFixed(2)} ر.س</td></tr>`).join('')}
    </table><br><div class="total">الإجمالي: ${order.total?.toFixed(2)} ر.س</div>
    <br><button onclick="window.print()">طباعة</button></body></html>`)
    w.document.close()
  }

  const columns = [
    { key: 'orderNumber', label: 'رقم الطلب', render: v => <span className="font-mono text-xs font-semibold text-honey-700 dark:text-honey-400">{v}</span> },
    { key: 'customerName', label: 'العميل', render: (v, r) => <div><p className="font-medium text-sm">{v || '—'}</p><p className="text-xs text-gray-400">{r.customerPhone || ''}</p></div> },
    { key: 'total', label: 'المبلغ', render: v => <span className="font-bold text-gray-800 dark:text-white">{v?.toLocaleString()} ر.س</span> },
    { key: 'status', label: 'الحالة', render: v => <span className={statusClasses[v]}>{statusLabels[v]}</span> },
    { key: 'paymentMethod', label: 'الدفع', render: v => <span className="text-xs text-gray-500">{paymentLabels[v]}</span> },
    { key: 'paymentStatus', label: 'حالة الدفع', render: v => <span className={`honey-badge ${v==='paid'?'bg-green-100 text-green-700':v==='partial'?'bg-yellow-100 text-yellow-700':'bg-red-100 text-red-600'}`}>{paymentStatusLabels[v]}</span> },
    { key: 'createdAt', label: 'التاريخ', render: v => <span className="text-xs text-gray-500">{new Date(v).toLocaleDateString('ar-SA')}</span> },
    { key: '_id', label: 'إجراءات', render: (v, row) => (
      <div className="flex items-center gap-2">
        <button onClick={() => setViewModal(row)} className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 rounded-lg transition-all"><MdVisibility size={18}/></button>
        <button onClick={() => setStatusModal(row)} className="p-1.5 hover:bg-honey-50 dark:hover:bg-honey-900/20 text-honey-600 rounded-lg transition-all"><MdEdit size={18}/></button>
        <button onClick={() => printInvoice(row)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 rounded-lg transition-all"><MdPrint size={18}/></button>
      </div>
    )}
  ]

  const subtotal = calcSubtotal()

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1 max-w-xl">
          <div className="relative flex-1">
            <MdSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث برقم الطلب أو اسم العميل..." className="honey-input pr-10"/>
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="honey-input w-36">
            <option value="">كل الحالات</option>
            {Object.entries(statusLabels).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <button onClick={() => { reset(); setModalOpen(true) }} className="honey-btn-primary">
          <MdAdd size={20}/> طلب جديد
        </button>
      </div>

      <div className="honey-card overflow-hidden">
        <Table columns={columns} data={orders} loading={loading} emptyMessage="لا توجد طلبات"/>
        <Pagination {...pagination} onPageChange={p => setPagination(prev => ({...prev, page: p}))}/>
      </div>

      {/* New Order Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="إنشاء طلب جديد" size="xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">العميل</label>
              <select {...register('customer')} className="honey-input">
                <option value="">زبون نقدي</option>
                {customers.map(c => <option key={c._id} value={c._id}>{c.name} - {c.phone}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم العميل (اختياري)</label>
              <input {...register('customerName')} className="honey-input" placeholder="إذا لم يكن في القائمة"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">هاتف العميل</label>
              <input {...register('customerPhone')} className="honey-input" placeholder="05xxxxxxxx"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">طريقة الدفع</label>
              <select {...register('paymentMethod')} className="honey-input">
                {Object.entries(paymentLabels).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-700 dark:text-gray-300">المنتجات</h4>
              <button type="button" onClick={() => append({ honey: '', quantity: 1, unitPrice: 0, discount: 0, total: 0 })}
                className="text-sm honey-btn-secondary py-1.5">+ إضافة منتج</button>
            </div>
            <div className="space-y-3">
              {fields.map((field, idx) => (
                <div key={field.id} className="grid grid-cols-5 gap-2 items-end bg-gray-50 dark:bg-gray-700/30 p-3 rounded-xl">
                  <div className="col-span-2">
                    <label className="text-xs text-gray-500 mb-1 block">نوع العسل</label>
                    <select {...register(`items.${idx}.honey`, { required: true })} className="honey-input text-sm"
                      onChange={e => onHoneySelect(idx, e.target.value)}>
                      <option value="">اختر...</option>
                      {honeys.map(h => <option key={h._id} value={h._id}>{h.name} ({h.price} ر.س)</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">الكمية</label>
                    <input {...register(`items.${idx}.quantity`, { required: true, min: 1, valueAsNumber: true })} type="number" min="1" className="honey-input text-sm"/>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">السعر</label>
                    <input {...register(`items.${idx}.unitPrice`, { valueAsNumber: true })} type="number" className="honey-input text-sm"/>
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 mb-1 block">خصم%</label>
                      <input {...register(`items.${idx}.discount`, { valueAsNumber: true })} type="number" min="0" max="100" className="honey-input text-sm" defaultValue={0}/>
                    </div>
                    {fields.length > 1 && (
                      <button type="button" onClick={() => remove(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all mb-0.5">✕</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-honey-50 dark:bg-honey-900/10 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-gray-600 dark:text-gray-400">المجموع الفرعي</span><span className="font-semibold">{subtotal.toFixed(2)} ر.س</span></div>
            <div className="flex items-center justify-between gap-2 text-sm">
              <label className="text-gray-600 dark:text-gray-400">خصم إجمالي (%)</label>
              <input {...register('orderDiscount', { valueAsNumber: true })} type="number" min="0" max="100" className="honey-input w-24 text-sm" defaultValue={0}/>
            </div>
            <div className="flex items-center justify-between gap-2 text-sm">
              <label className="text-gray-600 dark:text-gray-400">ضريبة (%)</label>
              <input {...register('tax', { valueAsNumber: true })} type="number" min="0" className="honey-input w-24 text-sm" defaultValue={0}/>
            </div>
            <div className="flex justify-between font-bold text-honey-700 dark:text-honey-400 text-base border-t border-honey-200 dark:border-honey-800 pt-2">
              <span>الإجمالي</span>
              <span>{(subtotal * (1 - (Number(watch('orderDiscount'))||0)/100)).toFixed(2)} ر.س</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">حالة الدفع</label>
              <select {...register('paymentStatus')} className="honey-input">
                <option value="pending">غير مدفوع</option>
                <option value="partial">مدفوع جزئياً</option>
                <option value="paid">مدفوع</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ملاحظات</label>
              <input {...register('notes')} className="honey-input" placeholder="أي ملاحظات..."/>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" className="honey-btn-primary flex-1 justify-center py-3">إنشاء الطلب</button>
            <button type="button" onClick={() => setModalOpen(false)} className="honey-btn-secondary">إلغاء</button>
          </div>
        </form>
      </Modal>

      {/* View Order Modal */}
      <Modal open={!!viewModal} onClose={() => setViewModal(null)} title={`تفاصيل الطلب - ${viewModal?.orderNumber}`} size="lg">
        {viewModal && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-xl"><p className="text-gray-500 text-xs mb-1">العميل</p><p className="font-semibold">{viewModal.customerName || '—'}</p></div>
              <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-xl"><p className="text-gray-500 text-xs mb-1">الهاتف</p><p className="font-semibold">{viewModal.customerPhone || '—'}</p></div>
              <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-xl"><p className="text-gray-500 text-xs mb-1">الحالة</p><span className={statusClasses[viewModal.status]}>{statusLabels[viewModal.status]}</span></div>
              <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-xl"><p className="text-gray-500 text-xs mb-1">طريقة الدفع</p><p className="font-semibold">{paymentLabels[viewModal.paymentMethod]}</p></div>
            </div>
            <div className="honey-card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50"><tr>{['المنتج','الكمية','السعر','الخصم','المجموع'].map(h=><th key={h} className="px-3 py-2 text-right text-xs text-gray-500">{h}</th>)}</tr></thead>
                <tbody>{viewModal.items?.map((item, i) => (
                  <tr key={i} className="border-t border-gray-100 dark:border-gray-700">
                    <td className="px-3 py-2 font-medium">{item.name}</td>
                    <td className="px-3 py-2">{item.quantity}</td>
                    <td className="px-3 py-2">{item.unitPrice} ر.س</td>
                    <td className="px-3 py-2">{item.discount}%</td>
                    <td className="px-3 py-2 font-bold text-honey-600">{item.total?.toFixed(2)} ر.س</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            <div className="bg-honey-50 dark:bg-honey-900/10 rounded-xl p-4 text-sm space-y-1">
              <div className="flex justify-between"><span>المجموع الفرعي</span><span>{viewModal.subtotal?.toFixed(2)} ر.س</span></div>
              {viewModal.discount > 0 && <div className="flex justify-between text-green-600"><span>الخصم</span><span>- {viewModal.discount?.toFixed(2)} ر.س</span></div>}
              <div className="flex justify-between font-bold text-honey-700 border-t pt-1"><span>الإجمالي</span><span>{viewModal.total?.toFixed(2)} ر.س</span></div>
              <div className="flex justify-between text-gray-500"><span>المدفوع</span><span>{viewModal.paidAmount?.toFixed(2)} ر.س</span></div>
            </div>
            <button onClick={() => printInvoice(viewModal)} className="honey-btn-secondary w-full justify-center py-2.5"><MdPrint size={18}/> طباعة الفاتورة</button>
          </div>
        )}
      </Modal>

      {/* Status Update Modal */}
      <Modal open={!!statusModal} onClose={() => setStatusModal(null)} title="تحديث حالة الطلب" size="sm">
        {statusModal && (
          <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target); handleStatusUpdate({ status: fd.get('status'), note: fd.get('note') }) }} className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">الطلب: <strong>{statusModal.orderNumber}</strong></p>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الحالة الجديدة</label>
              <select name="status" defaultValue={statusModal.status} className="honey-input">
                {Object.entries(statusLabels).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ملاحظة</label>
              <textarea name="note" rows={2} className="honey-input resize-none" placeholder="سبب التغيير..."/>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="honey-btn-primary flex-1 justify-center">حفظ</button>
              <button type="button" onClick={() => setStatusModal(null)} className="honey-btn-secondary">إلغاء</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
