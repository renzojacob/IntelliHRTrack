import { api } from './api'
import { useAuthStore } from '../store/authStore'

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  employee_id: number
  role?: string
}

export const authService = {
  async login(credentials: LoginCredentials) {
    const response = await api.post('/api/v1/auth/login', credentials)
    const { access_token, refresh_token, user } = response.data
    
    useAuthStore.getState().setAuth(user, access_token, refresh_token)
    
    return response.data
  },

  async logout() {
    useAuthStore.getState().logout()
  },

  async getCurrentUser() {
    const response = await api.get('/api/v1/auth/me')
    useAuthStore.getState().updateUser(response.data)
    return response.data
  },

  async register(data: RegisterData) {
    const response = await api.post('/api/v1/auth/register', data)
    return response.data
  },
}













