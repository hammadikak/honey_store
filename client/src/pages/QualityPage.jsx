import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { qualityAPI, honeyAPI, suppliersAPI } from '../services/api'
import Modal from '../components/common/Modal'
import Table from '../components/common/Table'
import toast from 'react-hot-toast'
import { MdAdd, MdCheckCircle, MdCancel, MdWarning } from 'react-icons/md'

const resultLabels = { passed: 'مقبول', failed: 'مرفوض', conditional: 'مشروط' }
const resultColors = { passed: 'bg-green-100 text-green-700', failed: 'bg-red-100 text-red-600', conditional: 'bg-yellow-100 text-yellow-700' }
const resultIcons = { passed: <MdCheckCircle className="text-green-500"/>, failed: <MdCancel className="text-red-500"/>, conditional: <MdWarning className="text-yellow-500"/> }

export default function QualityPage() {
  const [checks, setChecks] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [honeys, setHoneys] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const { register, handleSubmit, reset } = useForm()

  const load = async () => {
    setLoading(true)
    try {
      const res = await qualityAPI.getAll()
      setChecks(res.data)
    } catch { toast.error('فشل تحميل بيانات الجودة') }
    finally { setLoading(false) }
  }

  useEffect(() => {
    load()
    honeyAPI.getAll({ limit: 100 }).then(r => setHoneys(r.data)).catch(() => {})
    suppliersAPI.getAll({ limit: 100 }).then(r => setSuppliers(r.data)).catch(() => {})
  }, [])

  const onSubmit = async (data) => {
    try {
      await qualityAPI.create({ ...data, qualityScore: Number(data.qualityScore), quantity: Number(data.quantity), acceptedQuantity: Number(data.acceptedQuantity || data.quantity) })
      toast.success('تم تسجيل نتيجة الفحص')
      setModalOpen(false); reset(); load()
    } catch (err) { toast.error(err.message || 'فشل الحفظ') }
  }

  const columns = [
    { key: 'honey', label: 'نوع العسل', render: v => <span className="font-medium text-sm">{v?.name || '—'}</span> },
    { key: 'supplier', label: 'المورد', render: v => <span className="text-sm text-gray-600 dark:text-gray-400">{v?.name || '—'}</span> },
    { key: 'result', label: 'النتيجة', render: v => (
      <div className="flex items-center gap-1.5">
        {resultIcons[v]}
        <span className={`honey-badge ${resultColors[v]}`}>{resultLabels[v]}</span>
      </div>
    )},
    { key: 'qualityScore', label: 'نسبة الجودة', render: v => (
      <div className="flex items-center gap-2">
        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${v >= 80 ? 'bg-green-500' : v >= 60 ? 'bg-yellow-400' : 'bg-red-500'}`}
            style={{ width: `${v}%` }}/>
        </div>
        <span className="text-sm font-bold">{v}%</span>
      </div>
    )},
    { key: 'quantity', label: 'الكمية', render: (v, r) => <span className="text-sm">{v} كغ <span className="text-green-600">(مقبول: {r.acceptedQuantity})</span></span> },
    { key: 'inspectorName', label: 'المفتش', render: v => <span className="text-sm text-gray-500">{v || '—'}</span> },
    { key: 'checkDate', label: 'تاريخ الفحص', render: v => <span className="text-xs text-gray-400">{new Date(v).toLocaleDateString('ar-SA')}</span> },
  ]

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div className="grid grid-cols-3 gap-4 flex-1 ml-4">
          {[
            { label: 'إجمالي الفحوصات', value: checks.length, color: 'text-gray-800 dark:text-white', icon: '🔬' },
            { label: 'مقبول', value: checks.filter(c => c.result === 'passed').length, color: 'text-green-600', icon: '✅' },
            { label: 'مرفوض', value: checks.filter(c => c.result === 'failed').length, color: 'text-red-600', icon: '❌' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="honey-card p-4 flex items-center gap-3">
              <span className="text-2xl">{s.icon}</span>
              <div><p className={`text-2xl font-bold font-display ${s.color}`}>{s.value}</p><p className="text-xs text-gray-500">{s.label}</p></div>
            </motion.div>
          ))}
        </div>
        <button onClick={() => { reset(); setModalOpen(true) }} className="honey-btn-primary flex-shrink-0">
          <MdAdd size={20}/> تسجيل فحص
        </button>
      </div>

      <div className="honey-card overflow-hidden">
        <Table columns={columns} data={checks} loading={loading} emptyMessage="لا توجد فحوصات مسجلة"/>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="تسجيل نتيجة فحص الجودة" size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نوع العسل *</label>
              <select {...register('honey', {required:true})} className="honey-input">
                <option value="">اختر...</option>
                {honeys.map(h => <option key={h._id} value={h._id}>{h.name}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المورد</label>
              <select {...register('supplier')} className="honey-input">
                <option value="">اختر...</option>
                {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">النتيجة *</label>
              <select {...register('result', {required:true})} className="honey-input">
                <option value="passed">مقبول ✅</option>
                <option value="conditional">مشروط ⚠️</option>
                <option value="failed">مرفوض ❌</option>
              </select>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نسبة الجودة (0-100)</label>
              <input {...register('qualityScore', {required:true, min:0, max:100})} type="number" min="0" max="100" className="honey-input"/>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الكمية المستلمة (كغ)</label>
              <input {...register('quantity', {required:true, valueAsNumber:true})} type="number" min="0" className="honey-input"/>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الكمية المقبولة (كغ)</label>
              <input {...register('acceptedQuantity', {valueAsNumber:true})} type="number" min="0" className="honey-input"/>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">رقم الدفعة</label>
              <input {...register('batchNumber')} className="honey-input" placeholder="BATCH-001"/>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تاريخ الفحص</label>
              <input {...register('checkDate')} type="date" className="honey-input" defaultValue={new Date().toISOString().split('T')[0]}/>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {['moisture','color','taste','smell','density','purity'].map(param => (
              <div key={param}>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{moisture:'الرطوبة',color:'اللون',taste:'الطعم',smell:'الرائحة',density:'الكثافة',purity:'النقاء'}[param]}
                </label>
                <input {...register(`parameters.${param}.value`)} className="honey-input text-sm" placeholder="القيمة"/>
              </div>
            ))}
          </div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ملاحظات الفحص</label>
            <textarea {...register('notes')} rows={3} className="honey-input resize-none" placeholder="نتائج الفحص التفصيلية..."/>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="honey-btn-primary flex-1 justify-center">حفظ نتيجة الفحص</button>
            <button type="button" onClick={() => setModalOpen(false)} className="honey-btn-secondary">إلغاء</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
