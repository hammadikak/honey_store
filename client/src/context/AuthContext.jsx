import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext()
export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('honey_token')
    if (!token) { setLoading(false); return }
    try {
      const res = await authAPI.getMe()
      setUser(res.user)
    } catch { localStorage.removeItem('honey_token') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { loadUser() }, [loadUser])

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password })
    localStorage.setItem('honey_token', res.token)
    setUser(res.user)
    return res.user
  }

  const logout = () => {
    localStorage.removeItem('honey_token')
    setUser(null)
  }

  const hasRole = (...roles) => user && roles.includes(user.role)

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole, loadUser }}>
      {children}
    </AuthContext.Provider>
  )
}
