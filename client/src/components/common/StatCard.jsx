import { motion } from 'framer-motion'

export default function StatCard({ icon, title, value, subtitle, color = 'honey', trend, index = 0 }) {
  const colors = {
    honey: 'from-honey-500 to-honey-600', green: 'from-emerald-500 to-emerald-600',
    blue: 'from-blue-500 to-blue-600', purple: 'from-purple-500 to-purple-600',
    red: 'from-red-500 to-red-600', teal: 'from-teal-500 to-teal-600'
  }
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
      className="honey-card p-5 hover:shadow-md transition-all duration-300 group cursor-default">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">{title}</p>
          <p className="text-2xl font-display font-bold text-gray-800 dark:text-white">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>}
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              <span>{trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%</span>
              <span className="text-gray-400">مقارنة بالشهر الماضي</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-white text-2xl shadow-lg group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>
    </motion.div>
  )
}
