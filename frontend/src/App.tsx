import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Login from './pages/Login'
import Signup from './pages/Signup'
import AdminLayout from './layouts/AdminLayout'
import EmployeeLayout from './layouts/EmployeeLayout'
import AdminDashboard from './pages/admin/Dashboard'
import EmployeeDashboard from './pages/employee/Dashboard'
import Attendance from './pages/employee/Attendance'
import EmployeeManagement from './pages/admin/EmployeeManagement'
import Biometrics from './pages/admin/Biometrics'
import Payroll from './pages/admin/Payroll'
import EmployeePayroll from './pages/employee/Payroll'
import Leaves from './pages/admin/Leaves'
import EmployeeLeaves from './pages/employee/Leaves'
import Schedules from './pages/admin/Schedules'
import EmployeeSchedules from './pages/employee/Schedules'
import Analytics from './pages/admin/Analytics'
import Reports from './pages/admin/Reports'
import SystemAdmin from './pages/admin/SystemAdmin'

function App() {
  const { isAuthenticated, user } = useAuthStore()

  // Check localStorage on mount
  React.useEffect(() => {
    const token = localStorage.getItem('accessToken')
    const userStr = localStorage.getItem('user')
    if (token && userStr) {
      useAuthStore.setState({
        isAuthenticated: true,
        accessToken: token,
        user: JSON.parse(userStr),
      })
    }
  }, [])

  const isAdmin = user?.role && ['admin', 'super_admin', 'hr_admin', 'payroll_admin', 'manager'].includes(user.role)

  return (
    <Router>
      <Routes>
        {!isAuthenticated ? (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : isAdmin ? (
          <>
            <Route path="/admin/*" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="employees" element={<EmployeeManagement />} />
              <Route path="biometrics" element={<Biometrics />} />
              <Route path="payroll" element={<Payroll />} />
              <Route path="leaves" element={<Leaves />} />
              <Route path="schedules" element={<Schedules />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="reports" element={<Reports />} />
              <Route path="system" element={<SystemAdmin />} />
              <Route path="" element={<Navigate to="/admin/dashboard" replace />} />
            </Route>
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </>
        ) : (
          <>
            <Route path="/employee/*" element={<EmployeeLayout />}>
              <Route path="dashboard" element={<EmployeeDashboard />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="payroll" element={<EmployeePayroll />} />
              <Route path="leaves" element={<EmployeeLeaves />} />
              <Route path="schedules" element={<EmployeeSchedules />} />
              <Route path="" element={<Navigate to="/employee/dashboard" replace />} />
            </Route>
            <Route path="*" element={<Navigate to="/employee/dashboard" replace />} />
          </>
        )}
      </Routes>
    </Router>
  )
}

export default App
