import axios from 'axios'

const api = axios.create({ baseURL: '/api', timeout: 30000 })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('honey_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res.data,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('honey_token')
      window.location.href = '/login'
    }
    return Promise.reject(err.response?.data || err)
  }
)

export default api
export const authAPI = { login: d => api.post('/auth/login', d), getMe: () => api.get('/auth/me'), updatePassword: d => api.put('/auth/password', d) }
export const honeyAPI = { getAll: p => api.get('/honey', { params: p }), getOne: id => api.get(`/honey/${id}`), create: d => api.post('/honey', d, { headers: { 'Content-Type': 'multipart/form-data' } }), update: (id, d) => api.put(`/honey/${id}`, d, { headers: { 'Content-Type': 'multipart/form-data' } }), delete: id => api.delete(`/honey/${id}`) }
export const ordersAPI = { getAll: p => api.get('/orders', { params: p }), getOne: id => api.get(`/orders/${id}`), create: d => api.post('/orders', d), updateStatus: (id, d) => api.put(`/orders/${id}/status`, d), getStats: () => api.get('/orders/stats') }
export const customersAPI = { getAll: p => api.get('/customers', { params: p }), getOne: id => api.get(`/customers/${id}`), create: d => api.post('/customers', d), update: (id, d) => api.put(`/customers/${id}`, d), delete: id => api.delete(`/customers/${id}`) }
export const suppliersAPI = { getAll: p => api.get('/suppliers', { params: p }), getOne: id => api.get(`/suppliers/${id}`), create: d => api.post('/suppliers', d), update: (id, d) => api.put(`/suppliers/${id}`, d), delete: id => api.delete(`/suppliers/${id}`) }
export const inventoryAPI = { getAll: p => api.get('/inventory', { params: p }), getMovements: p => api.get('/inventory/movements', { params: p }), adjust: d => api.post('/inventory/adjust', d) }
export const dashboardAPI = { getStats: () => api.get('/dashboard/stats') }
export const reportsAPI = { getSales: p => api.get('/reports/sales', { params: p }), getInventory: () => api.get('/reports/inventory') }
export const usersAPI = { getAll: () => api.get('/users'), create: d => api.post('/users', d), update: (id, d) => api.put(`/users/${id}`, d), delete: id => api.delete(`/users/${id}`) }
export const qualityAPI = { getAll: () => api.get('/quality'), create: d => api.post('/quality', d) }
