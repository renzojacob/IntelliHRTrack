import { useState } from 'react'
import { authService } from '../services/auth.service'
import { useAuthStore } from '../store/authStore'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await authService.login({ username, password })
      // Navigation will happen automatically via App.tsx
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  // Demo mode - Quick access for testing
  const handleDemoLogin = (role: 'admin' | 'employee') => {
    if (role === 'admin') {
      setAuth(
        {
          id: 1,
          username: 'admin',
          email: 'admin@thinkweb.com',
          role: 'super_admin',
          employee: {
            id: 1,
            employee_id: 'EMP-0001',
            first_name: 'Admin',
            last_name: 'User',
            email: 'admin@thinkweb.com',
            department_id: 1,
          },
        },
        'demo-token-admin',
        'demo-refresh-token'
      )
    } else {
      setAuth(
        {
          id: 2,
          username: 'employee',
          email: 'employee@thinkweb.com',
          role: 'employee',
          employee: {
            id: 2,
            employee_id: 'EMP-0002',
            first_name: 'John',
            last_name: 'Doe',
            email: 'employee@thinkweb.com',
            department_id: 2,
          },
        },
        'demo-token-employee',
        'demo-refresh-token'
      )
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
      <div className="glass-card w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-teal-600 dark:text-teal-400 mb-2">Think Web</h1>
          <p className="text-gray-600 dark:text-gray-400">Employee Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Demo Mode - Quick Access */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-3">
            Quick Demo Access (No Backend Required)
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:shadow-lg transition-all text-sm"
            >
              <iconify-icon icon="ph:user-gear-duotone" className="inline mr-2"></iconify-icon>
              Admin Demo
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('employee')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-medium hover:shadow-lg transition-all text-sm"
            >
              <iconify-icon icon="ph:user-duotone" className="inline mr-2"></iconify-icon>
              Employee Demo
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-3">
            Use these buttons to quickly test both admin and employee views
          </p>
        </div>
      </div>
    </div>
  )
}
