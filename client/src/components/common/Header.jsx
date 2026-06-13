import { MdMenu, MdNotifications, MdDarkMode, MdLightMode, MdSearch } from 'react-icons/md'
import { useTheme } from '../../context/ThemeContext'
import { useLocation } from 'react-router-dom'
import { useState } from 'react'

const pageNames = {
  '/': 'لوحة التحكم', '/honey': 'إدارة العسل', '/orders': 'الطلبات',
  '/customers': 'العملاء', '/suppliers': 'الموردين', '/inventory': 'المخزون',
  '/quality': 'فحص الجودة', '/reports': 'التقارير والإحصائيات', '/users': 'إدارة الموظفين'
}

export default function Header({ onMenuClick }) {
  const { darkMode, toggleDark } = useTheme()
  const location = useLocation()
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <button onClick={onMenuClick} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
            <MdMenu size={22} />
          </button>
          <div>
            <h2 className="font-display font-bold text-gray-800 dark:text-white text-lg">
              {pageNames[location.pathname] || 'نظام العسل'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
              {new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleDark} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all">
            {darkMode ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
          </button>
          <button className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 relative">
            <MdNotifications size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  )
}
