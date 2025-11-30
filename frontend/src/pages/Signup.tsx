import React, { useState } from 'react'
import { authService } from '../services/auth.service'
import { useNavigate, Link } from 'react-router-dom'

export default function Signup() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [employeeId, setEmployeeId] = useState<number | ''>('')
  const [role, setRole] = useState<'admin' | 'employee'>('employee')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      await authService.register({
        username,
        email,
        password,
        employee_id: employeeId === '' ? 0 : Number(employeeId),
        role,
      })
      setSuccess('Registration successful. Please login.')
      setTimeout(() => navigate('/login'), 1200)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
      <div className="glass-card w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-teal-600 dark:text-teal-400 mb-2">Create account</h1>
          <p className="text-gray-600 dark:text-gray-400">Register as Admin or Employee</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded">{error}</div>}
          {success && <div className="bg-green-100 dark:bg-green-900/30 border border-green-400 text-green-700 dark:text-green-400 px-4 py-3 rounded">{success}</div>}

          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-2">Username</label>
            <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700" />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700" />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700" />
          </div>

          <div>
            <label htmlFor="employeeId" className="block text-sm font-medium mb-2">Employee ID (optional)</label>
            <input id="employeeId" type="number" value={employeeId as any} onChange={(e) => setEmployeeId(e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700" />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium mb-2">Register as</label>
            <select id="role" value={role} onChange={(e) => setRole(e.target.value as any)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700">
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Creating...' : 'Sign up'}</button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-600 font-medium hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
