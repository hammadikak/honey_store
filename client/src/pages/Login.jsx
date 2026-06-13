import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await login(data.email, data.password)
      toast.success('مرحباً بك في نظام إدارة العسل! 🍯')
      navigate('/')
    } catch (err) {
      toast.error(err.message || 'بيانات الدخول غير صحيحة')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-honey-900 via-honey-800 to-amber-900">
      {/* Background honeycomb pattern */}
      <div className="absolute inset-0 opacity-10">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="absolute text-6xl select-none" style={{ top: `${Math.random()*100}%`, left: `${Math.random()*100}%`, transform: `rotate(${Math.random()*360}deg)` }}>🍯</div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 mx-auto bg-honey-400 rounded-2xl flex items-center justify-center text-5xl shadow-xl mb-4">
              🍯
            </motion.div>
            <h1 className="font-display text-3xl font-bold text-white mb-1">نظام إدارة العسل</h1>
            <p className="text-honey-200 text-sm">تسجيل الدخول للنظام</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-honey-200 text-sm font-medium mb-2">البريد الإلكتروني</label>
              <div className="relative">
                <MdEmail className="absolute right-3 top-1/2 -translate-y-1/2 text-honey-400" size={20} />
                <input
                  {...register('email', { required: 'البريد الإلكتروني مطلوب' })}
                  type="email"
                  placeholder="admin@honey.com"
                  className="w-full bg-white/10 text-white placeholder-honey-300 border border-white/20 rounded-xl pr-10 pl-4 py-3 focus:outline-none focus:ring-2 focus:ring-honey-400 focus:border-transparent transition-all"
                />
              </div>
              {errors.email && <p className="text-red-300 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-honey-200 text-sm font-medium mb-2">كلمة المرور</label>
              <div className="relative">
                <MdLock className="absolute right-3 top-1/2 -translate-y-1/2 text-honey-400" size={20} />
                <input
                  {...register('password', { required: 'كلمة المرور مطلوبة' })}
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full bg-white/10 text-white placeholder-honey-300 border border-white/20 rounded-xl pr-10 pl-10 py-3 focus:outline-none focus:ring-2 focus:ring-honey-400 focus:border-transparent transition-all"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-honey-400 hover:text-honey-200">
                  {showPwd ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                </button>
              </div>
              {errors.password && <p className="text-red-300 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              type="submit" disabled={loading}
              className="w-full py-3 bg-honey-500 hover:bg-honey-400 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>جاري الدخول...</span></>
              ) : <span>تسجيل الدخول</span>}
            </motion.button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <p className="text-honey-300 text-xs text-center mb-3">حسابات تجريبية:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[['admin@honey.com', 'admin123', 'مدير'], ['sales@honey.com', 'sales123', 'مبيعات']].map(([email, pwd, label]) => (
                <button key={email} type="button"
                  onClick={() => { document.querySelector('input[type=email]').value = email; }}
                  className="text-honey-300 hover:text-honey-100 bg-white/5 hover:bg-white/10 rounded-lg p-2 transition-all text-right">
                  <span className="block font-medium">{label}</span>
                  <span className="opacity-70">{email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
