import { create } from 'zustand'

interface User {
  id: number
  username: string
  email: string
  role: string
  employee?: {
    id: number
    employee_id: string
    first_name: string
    last_name: string
    email: string
    department_id?: number
  }
}

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  setAuth: (user: User, accessToken: string, refreshToken: string) => void
  logout: () => void
  updateUser: (user: User) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  setAuth: (user, accessToken, refreshToken) => {
    // Store in localStorage (standard keys used across services)
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('user', JSON.stringify(user))
    set({
      isAuthenticated: true,
      user,
      accessToken,
      refreshToken,
    })
  },
  logout: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    set({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
    })
  },
  updateUser: (user) =>
    set((state) => ({
      user: { ...state.user, ...user },
    })),
}))

// Initialize from localStorage on app start
const storedToken = localStorage.getItem('accessToken')
const storedUser = localStorage.getItem('user')
if (storedToken && storedUser) {
  useAuthStore.setState({
    isAuthenticated: true,
    accessToken: storedToken,
    user: JSON.parse(storedUser),
  })
}
