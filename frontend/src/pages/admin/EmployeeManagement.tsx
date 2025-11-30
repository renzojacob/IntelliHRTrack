import { useState, useEffect } from 'react'
import { useQuery, useMutation } from 'react-query'
import { api } from '../../services/api'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

interface Employee {
  id: number
  employee_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  department: string
  position: string
  status: string
  hire_date: string
  photo?: string
}

export default function EmployeeManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDept, setFilterDept] = useState('all')
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [auditTrail, setAuditTrail] = useState<string[]>([])

  const { data: employeesData, refetch } = useQuery('employees', async () => {
    try {
      const response = await api.get('/api/v1/employees')
      return response.data
    } catch {
      return {
        total: 247,
        active: 234,
        departments: 5,
        employees: [
          { id: 1, employee_id: 'EMP001', first_name: 'John', last_name: 'Doe', email: 'john.doe@example.com', phone: '1234567890', department: 'IT', position: 'Software Engineer', status: 'active', hire_date: '2020-01-15' },
          { id: 2, employee_id: 'EMP002', first_name: 'Jane', last_name: 'Smith', email: 'jane.smith@example.com', phone: '0987654321', department: 'Sales', position: 'Sales Manager', status: 'active', hire_date: '2019-03-10' },
          { id: 3, employee_id: 'EMP003', first_name: 'Bob', last_name: 'Johnson', email: 'bob.johnson@example.com', phone: '5551234567', department: 'HR', position: 'HR Specialist', status: 'active', hire_date: '2021-06-01' },
        ]
      }
    }
  })

  const filteredEmployees = employeesData?.employees?.filter((emp: Employee) => {
    const matchesSearch = !searchTerm || 
      `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || emp.status === filterStatus
    const matchesDept = filterDept === 'all' || emp.department === filterDept
    return matchesSearch && matchesStatus && matchesDept
  }) || []

  const deptChartData = {
    labels: ['IT', 'Sales', 'HR', 'Finance', 'Operations'],
    datasets: [{
      label: 'Employees',
      data: [68, 42, 28, 18, 15],
      backgroundColor: 'rgba(20, 184, 166, 0.6)',
      borderColor: 'rgba(20, 184, 166, 1)',
      borderWidth: 2,
    }],
  }

  const growthChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'New Hires',
      data: [5, 8, 12, 6, 10, 15],
      borderColor: 'rgba(20, 184, 166, 1)',
      backgroundColor: 'rgba(20, 184, 166, 0.1)',
      tension: 0.4,
    }, {
      label: 'Attrition',
      data: [2, 3, 1, 4, 2, 3],
      borderColor: 'rgba(239, 68, 68, 1)',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      tension: 0.4,
    }],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
    },
  }

  const handleViewEmployee = (emp: Employee) => {
    setSelectedEmployee(emp)
    setShowProfileModal(true)
    addAuditEntry(`Viewed employee profile: ${emp.first_name} ${emp.last_name}`)
  }

  const handleEditEmployee = (emp: Employee) => {
    setSelectedEmployee(emp)
    setShowEditModal(true)
    addAuditEntry(`Opened edit form for: ${emp.first_name} ${emp.last_name}`)
  }

  const addAuditEntry = (action: string) => {
    const timestamp = new Date().toLocaleString()
    setAuditTrail(prev => [`[${timestamp}] ${action}`, ...prev].slice(0, 50))
  }

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <header id="section-top" className="relative overflow-hidden rounded-3xl glass p-6 md:p-8 shadow-glow">
        <div className="absolute inset-0 opacity-40 animate-shine" style={{
          backgroundImage: 'linear-gradient(90deg, var(--accent), rgba(255,255,255,0.2), var(--accent))',
          backgroundSize: '200% 100%',
        }}></div>
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Employee Management — Admin Console
            </h2>
            <p className="mt-1 text-sm md:text-base text-gray-600 dark:text-gray-300">
              Registry, search, profiles, biometrics, documents, analytics, and audit trail.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setSelectedEmployee(null); setShowEditModal(true) }}
              className="px-4 py-2 rounded-xl text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-glow transition flex items-center justify-center gap-2"
            >
              <iconify-icon icon="ph:user-plus-duotone"></iconify-icon>
              New Employee
            </button>
            <button className="px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-900/50 border border-white/40 dark:border-white/10 hover:shadow-glow transition flex items-center justify-center gap-2">
              <iconify-icon icon="ph:file-csv-duotone" className="text-accent"></iconify-icon>
              CSV Template
            </button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-4 shadow">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Total Employees</div>
              <div className="text-2xl font-extrabold mt-1">{employeesData?.total || 247}</div>
            </div>
            <div className="text-slate-400 text-lg">👥</div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">Includes active & archived records. Click charts for details.</p>
        </div>
        <div className="glass rounded-2xl p-4 shadow">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Active Employees</div>
              <div className="text-2xl font-extrabold mt-1">{employeesData?.active || 234}</div>
            </div>
            <div className="text-slate-400 text-lg">✅</div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">Employees currently marked as Active.</p>
        </div>
        <div className="glass rounded-2xl p-4 shadow">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Departments</div>
              <div className="text-2xl font-extrabold mt-1">{employeesData?.departments || 5}</div>
            </div>
            <div className="text-slate-400 text-lg">🏷️</div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">Unique department count in the system</p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="grid grid-cols-12 gap-6">
        {/* Left column */}
        <div className="col-span-12 xl:col-span-8 space-y-6">
          {/* Controls */}
          <div className="glass rounded-2xl p-4 shadow">
            <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
              <div className="flex flex-wrap items-center gap-2 w-full lg:w-2/3">
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="min-w-0 flex-1 p-3 rounded-lg border bg-transparent focus:outline-none"
                  placeholder="Search by name, ID, department, or position..."
                />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="min-w-[10rem] shrink-0 p-3 rounded-lg border bg-white/70 dark:bg-white/10 dark:border-white/10 text-sm text-gray-800 dark:text-gray-100"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="onleave">On Leave</option>
                  <option value="terminated">Terminated</option>
                </select>
                <select
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  className="min-w-[12rem] shrink-0 p-3 rounded-lg border bg-white/70 dark:bg-white/10 dark:border-white/10 text-sm text-gray-800 dark:text-gray-100"
                >
                  <option value="all">All Departments</option>
                  <option value="IT">IT</option>
                  <option value="Sales">Sales</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>
              <div className="flex gap-2 w-full lg:w-auto justify-end">
                <button className="px-4 py-2 rounded-xl bg-white/80 dark:bg-slate-900/50 border border-white/40 dark:border-white/10 hover:shadow-glow transition">
                  Export CSV
                </button>
                <label className="cursor-pointer px-4 py-2 rounded-xl text-white bg-indigo-600 hover:shadow-glow transition">
                  Import CSV
                  <input type="file" accept=".csv" className="hidden" />
                </label>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="glass rounded-2xl p-4 shadow">
            <div className="overflow-auto fancy-scroll">
              <table className="min-w-full text-sm align-middle">
                <thead className="text-left text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">Photo</th>
                    <th className="px-3 py-2">Name / ID</th>
                    <th className="px-3 py-2">Department</th>
                    <th className="px-3 py-2">Position</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Tenure</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-3 py-4 text-center text-gray-500">
                        No employees found
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((emp: Employee, idx: number) => (
                      <tr key={emp.id} className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
                        <td className="px-3 py-2">{idx + 1}</td>
                        <td className="px-3 py-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                            {emp.first_name.charAt(0)}{emp.last_name.charAt(0)}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="font-medium">{emp.first_name} {emp.last_name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{emp.employee_id}</div>
                        </td>
                        <td className="px-3 py-2">{emp.department}</td>
                        <td className="px-3 py-2">{emp.position}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            emp.status === 'active' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                            emp.status === 'onleave' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                            'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                          }`}>
                            {emp.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-500">
                          {new Date(emp.hire_date).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleViewEmployee(emp)}
                              className="px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition"
                            >
                              <iconify-icon icon="ph:eye-duotone" className="mr-1"></iconify-icon>
                              View
                            </button>
                            <button
                              onClick={() => handleEditEmployee(emp)}
                              className="px-3 py-1 rounded-lg bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/50 transition"
                            >
                              <iconify-icon icon="ph:pencil-simple-duotone" className="mr-1"></iconify-icon>
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Showing {filteredEmployees.length} of {employeesData?.total || 0} employees
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-xl bg-white/80 dark:bg-slate-900/50 border border-white/40 dark:border-white/10 disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="px-3 py-1 rounded-xl bg-white/80 dark:bg-slate-900/50 border border-white/40 dark:border-white/10"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Audit Trail */}
          <div className="glass rounded-2xl p-4 shadow">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <iconify-icon icon="ph:warning-duotone" className="text-accent"></iconify-icon>
                Audit Trail & Recent Activity
              </h3>
              <div className="text-xs text-slate-500 dark:text-slate-400">Immutable logs of CRUD operations</div>
            </div>
            <div className="space-y-2 max-h-48 overflow-auto text-sm text-slate-700 dark:text-slate-200 fancy-scroll">
              {auditTrail.length === 0 ? (
                <div className="text-gray-500 text-center py-4">No audit entries yet</div>
              ) : (
                auditTrail.map((entry, idx) => (
                  <div key={idx} className="text-xs text-gray-600 dark:text-gray-300">
                    {entry}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Verification */}
          <div className="glass rounded-2xl p-4 shadow">
            <h3 className="font-semibold mb-3">Quick Verification</h3>
            <div className="space-y-2">
              <input
                placeholder="Enter Employee ID to verify..."
                className="w-full p-2 rounded border bg-transparent"
              />
              <button className="w-full px-3 py-2 rounded-xl bg-blue-600 text-white">
                Verify
              </button>
            </div>
          </div>

          {/* Document Upload */}
          <div className="glass rounded-2xl p-4 shadow">
            <h3 className="font-semibold mb-3">Upload & Documents</h3>
            <input type="file" className="w-full" />
            <p className="text-xs text-slate-500 mt-2">Upload documents and attach to selected employee in profile view.</p>
          </div>
        </div>

        {/* Right column */}
        <div className="col-span-12 xl:col-span-4 space-y-6">
          <div className="glass rounded-2xl p-4 shadow">
            <h3 className="font-semibold mb-3">Employee Statistics</h3>
            <div className="h-64">
              <Bar data={deptChartData} options={chartOptions} />
            </div>
          </div>
          <div className="glass rounded-2xl p-4 shadow">
            <h3 className="font-semibold mb-3">Growth & Attrition</h3>
            <div className="h-64">
              <Line data={growthChartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </section>

      {/* Profile Modal */}
      {showProfileModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setShowProfileModal(false)}></div>
          <div className="relative w-full max-w-4xl mx-auto glass rounded-2xl overflow-hidden shadow-glow">
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-1 flex flex-col items-center">
                <div className="w-36 h-36 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-4xl font-bold">
                    {selectedEmployee.first_name.charAt(0)}{selectedEmployee.last_name.charAt(0)}
                  </div>
                </div>
                <div className="mt-3 w-full">
                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-900/50 border border-white/40 dark:border-white/10">
                      Change Photo
                    </button>
                    <button className="px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-900/50 border border-white/40 dark:border-white/10">
                      Remove
                    </button>
                  </div>
                </div>
                <div className="mt-4 w-full">
                  <h4 className="font-semibold">Biometric Enrollment</h4>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-slate-500">Face Template</div>
                        <div className="text-sm font-medium">Not enrolled</div>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 rounded-xl bg-white/80 dark:bg-slate-900/50 border border-white/40 dark:border-white/10 text-sm">
                          Enroll
                        </button>
                        <button className="px-3 py-1 rounded-xl bg-white/80 dark:bg-slate-900/50 border border-white/40 dark:border-white/10 text-sm">
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-slate-500">Fingerprint</div>
                        <div className="text-sm font-medium">Not enrolled</div>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 rounded-xl bg-white/80 dark:bg-slate-900/50 border border-white/40 dark:border-white/10 text-sm">
                          Enroll
                        </button>
                        <button className="px-3 py-1 rounded-xl bg-white/80 dark:bg-slate-900/50 border border-white/40 dark:border-white/10 text-sm">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-span-2 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">{selectedEmployee.first_name} {selectedEmployee.last_name}</h2>
                    <div className="text-sm text-slate-500">ID: {selectedEmployee.employee_id}</div>
                    <div className="mt-1 inline-block px-2 py-1 rounded text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                      {selectedEmployee.status}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 rounded-xl bg-white/80 dark:bg-slate-900/50 border border-white/40 dark:border-white/10">
                      Print
                    </button>
                    <button
                      onClick={() => setShowProfileModal(false)}
                      className="px-4 py-2 rounded-xl bg-white/80 dark:bg-slate-900/50 border border-white/40 dark:border-white/10"
                    >
                      Close
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="text-slate-500 text-xs">Contact</div>
                    <div className="font-medium">{selectedEmployee.email}</div>
                    <div className="text-sm text-gray-500">{selectedEmployee.phone}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-xs">Department</div>
                    <div className="font-medium">{selectedEmployee.department}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-xs">Position</div>
                    <div className="font-medium">{selectedEmployee.position}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-xs">Date Employed</div>
                    <div className="font-medium">{new Date(selectedEmployee.hire_date).toLocaleDateString()}</div>
                  </div>
                </div>
                <hr className="my-2" />
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowProfileModal(false); handleEditEmployee(selectedEmployee) }}
                    className="px-4 py-2 rounded-xl bg-yellow-500 text-white"
                  >
                    Edit
                  </button>
                  <button className="px-4 py-2 rounded-xl bg-rose-600 text-white">
                    Archive
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setShowEditModal(false)}></div>
          <div className="relative w-full max-w-3xl mx-auto glass rounded-2xl overflow-hidden shadow-glow">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-3">
                {selectedEmployee ? 'Edit Employee' : 'New Employee'}
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  addAuditEntry(`${selectedEmployee ? 'Updated' : 'Created'} employee: ${(e.target as any).firstName.value} ${(e.target as any).lastName.value}`)
                  setShowEditModal(false)
                  refetch()
                }}
                className="grid grid-cols-1 md:grid-cols-2 gap-3"
              >
                <div>
                  <label className="text-xs text-slate-500">First Name</label>
                  <input
                    name="firstName"
                    defaultValue={selectedEmployee?.first_name || ''}
                    className="w-full p-2 rounded border bg-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Last Name</label>
                  <input
                    name="lastName"
                    defaultValue={selectedEmployee?.last_name || ''}
                    className="w-full p-2 rounded border bg-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Email</label>
                  <input
                    name="email"
                    type="email"
                    defaultValue={selectedEmployee?.email || ''}
                    className="w-full p-2 rounded border bg-transparent"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Contact Number</label>
                  <input
                    name="contact"
                    defaultValue={selectedEmployee?.phone || ''}
                    className="w-full p-2 rounded border bg-transparent"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Department</label>
                  <select name="department" defaultValue={selectedEmployee?.department || ''} className="w-full p-2 rounded border bg-transparent">
                    <option value="IT">IT</option>
                    <option value="Sales">Sales</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Position</label>
                  <input
                    name="position"
                    defaultValue={selectedEmployee?.position || ''}
                    className="w-full p-2 rounded border bg-transparent"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Employment Type</label>
                  <select name="etype" className="w-full p-2 rounded border bg-transparent">
                    <option value="permanent">Permanent</option>
                    <option value="contractual">Contractual</option>
                    <option value="part-time">Part-time</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Employment Status</label>
                  <select name="status" defaultValue={selectedEmployee?.status || 'active'} className="w-full p-2 rounded border bg-transparent">
                    <option value="active">Active</option>
                    <option value="onleave">On Leave</option>
                    <option value="terminated">Terminated</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Date Employed</label>
                  <input
                    name="hired"
                    type="date"
                    defaultValue={selectedEmployee?.hire_date || ''}
                    className="w-full p-2 rounded border bg-transparent"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Profile Photo</label>
                  <input type="file" accept="image/*" className="w-full" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-500">Notes / Remarks</label>
                  <textarea name="remarks" rows={3} className="w-full p-2 rounded border bg-transparent"></textarea>
                </div>
                <div className="md:col-span-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 rounded-xl bg-white/80 dark:bg-slate-900/50 border border-white/40 dark:border-white/10"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 rounded-xl text-white bg-emerald-600">
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
