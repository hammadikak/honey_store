export default function Pagination({ page, pages, total, limit, onPageChange }) {
  if (pages <= 1) return null
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700">
      <p className="text-sm text-gray-500">إجمالي {total} سجل</p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(page - 1)} disabled={page <= 1}
          className="px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
          السابق
        </button>
        {[...Array(Math.min(pages, 5))].map((_, i) => {
          const p = i + 1
          return (
            <button key={p} onClick={() => onPageChange(p)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${p === page ? 'bg-honey-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
              {p}
            </button>
          )
        })}
        <button onClick={() => onPageChange(page + 1)} disabled={page >= pages}
          className="px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
          التالي
        </button>
      </div>
    </div>
  )
}
