import { motion } from 'framer-motion'

export default function Table({ columns, data, loading, emptyMessage = 'لا توجد بيانات' }) {
  if (loading) return (
    <div className="space-y-3 p-4">
      {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}
    </div>
  )
  if (!data?.length) return (
    <div className="text-center py-16 text-gray-400 dark:text-gray-500">
      <div className="text-5xl mb-3">📭</div>
      <p className="font-medium">{emptyMessage}</p>
    </div>
  )
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-700/50">
            {columns.map(col => (
              <th key={col.key} className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {data.map((row, i) => (
            <motion.tr key={row._id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
              className="hover:bg-honey-50 dark:hover:bg-gray-700/30 transition-colors">
              {columns.map(col => (
                <td key={col.key} className="px-4 py-3 text-gray-700 dark:text-gray-300">
                  {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
