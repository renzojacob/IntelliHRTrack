import api from './api'

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'employee';
  first_name: string;
  last_name: string;
  department: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'employee';
  first_name: string;
  last_name: string;
  department: string;
}

class AuthService {
  async register(data: RegisterData): Promise<User> {
    const response = await api.post('/api/v1/auth/register', data)
    return response.data
  }

  async login(data: LoginData): Promise<{ access_token: string; token_type: string; user: User }> {
    const formData = new URLSearchParams()
    formData.append('username', data.username)
    formData.append('password', data.password)
    
    const response = await api.post('/api/v1/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    
    // Store token and user in localStorage
    if (response.data.access_token) {
      localStorage.setItem('accessToken', response.data.access_token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    
    return response.data
  }

  logout(): void {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken')
  }
}

export const authService = new AuthService()