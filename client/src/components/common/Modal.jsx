import { motion, AnimatePresence } from 'framer-motion'
import { MdClose } from 'react-icons/md'

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }} transition={{ type: 'spring', damping: 25 }}
            className={`relative w-full ${sizes[size]} bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-h-[90vh] flex flex-col`}>
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-display font-bold text-lg text-gray-800 dark:text-white">{title}</h3>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-all">
                <MdClose size={20} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
