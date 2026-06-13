import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/common/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import HoneyList from './pages/HoneyList'
import OrderList from './pages/OrderList'
import CustomerList from './pages/CustomerList'
import SupplierList from './pages/SupplierList'
import InventoryPage from './pages/InventoryPage'
import ReportsPage from './pages/ReportsPage'
import UsersPage from './pages/UsersPage'
import QualityPage from './pages/QualityPage'

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-honey-50 dark:bg-gray-900"><div className="text-4xl animate-bounce">🍯</div></div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-center" toastOptions={{ duration: 3000, style: { fontFamily: 'Tajawal, sans-serif', direction: 'rtl' } }} />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="honey" element={<HoneyList />} />
              <Route path="orders" element={<OrderList />} />
              <Route path="customers" element={<CustomerList />} />
              <Route path="suppliers" element={<SupplierList />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="quality" element={<QualityPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="users" element={<ProtectedRoute roles={['admin']}><UsersPage /></ProtectedRoute>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
