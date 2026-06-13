import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import {
  MdDashboard, MdInventory2, MdShoppingCart, MdPeople, MdLocalShipping,
  MdWarehouse, MdBarChart, MdSupervisorAccount, MdScience, MdLogout, MdClose
} from 'react-icons/md'
import { GiHoneycomb } from 'react-icons/gi'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/', label: 'لوحة التحكم', icon: MdDashboard, exact: true },
  { to: '/honey', label: 'أنواع العسل', icon: GiHoneycomb },
  { to: '/orders', label: 'الطلبات', icon: MdShoppingCart },
  { to: '/customers', label: 'العملاء', icon: MdPeople },
  { to: '/suppliers', label: 'الموردين', icon: MdLocalShipping },
  { to: '/inventory', label: 'المخزون', icon: MdWarehouse },
  { to: '/quality', label: 'فحص الجودة', icon: MdScience },
  { to: '/reports', label: 'التقارير', icon: MdBarChart },
  { to: '/users', label: 'إدارة الموظفين', icon: MdSupervisorAccount, adminOnly: true },
]

const SidebarContent = ({ onClose }) => {
  const { user, logout, hasRole } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('تم تسجيل الخروج')
    navigate('/login')
  }

  const roleLabels = {
    admin: 'مدير النظام', inventory_manager: 'مسؤول المخزون',
    sales_manager: 'مسؤول المبيعات', supplier_manager: 'مسؤول الموردين',
    customer_service: 'خدمة العملاء'
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-honey-900 via-honey-800 to-honey-900 text-white">
      {/* Logo */}
      <div className="p-6 flex items-center justify-between border-b border-honey-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-honey-400 rounded-xl flex items-center justify-center text-2xl shadow-lg">🍯</div>
          <div>
            <h1 className="font-display font-bold text-lg leading-tight">نظام العسل</h1>
            <p className="text-honey-300 text-xs">إدارة متجر العسل</p>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden p-1 rounded-lg hover:bg-honey-700">
          <MdClose size={20} />
        </button>
      </div>

      {/* User info */}
      <div className="p-4 mx-4 my-4 bg-honey-700/50 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-honey-400 rounded-full flex items-center justify-center font-bold text-honey-900 text-lg">
            {user?.name?.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="font-semibold text-sm truncate">{user?.name}</p>
            <p className="text-honey-300 text-xs">{roleLabels[user?.role]}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.filter(item => !item.adminOnly || hasRole('admin')).map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-honey-500 text-white shadow-lg shadow-honey-600/30'
                  : 'text-honey-200 hover:bg-honey-700 hover:text-white'
              }`
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-honey-700">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-honey-300 hover:bg-red-500/20 hover:text-red-300 transition-all">
          <MdLogout size={20} />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  )
}

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:right-0 lg:w-64 lg:flex z-40">
        <SidebarContent onClose={onClose} />
      </div>
      {/* Mobile */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
            <motion.div initial={{ x: 300 }} animate={{ x: 0 }} exit={{ x: 300 }} transition={{ type: 'spring', damping: 25 }}
              className="fixed inset-y-0 right-0 w-64 z-50 lg:hidden">
              <SidebarContent onClose={onClose} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
