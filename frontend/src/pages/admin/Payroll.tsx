import { useState } from 'react'
import { useQuery } from 'react-query'
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
import { Bar, Line, Pie } from 'react-chartjs-2'

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

export default function Payroll() {
  const [activeTab, setActiveTab] = useState('processing')
  const [selectedPeriod, setSelectedPeriod] = useState('December 2023')

  const { data: payrollData } = useQuery('payroll-data', async () => {
    try {
      const response = await api.get('/api/v1/payroll/periods')
      return response.data
    } catch {
      return {
        totalPayroll: 284750,
        pendingApproval: 152430,
        overtimeCosts: 12480,
        taxDeductions: 42150,
        departments: [
          { name: 'Engineering', employees: 68, basePay: 142500, overtime: 8240, deductions: 21375, netPay: 129365 },
          { name: 'Sales', employees: 42, basePay: 89750, overtime: 2150, deductions: 13462, netPay: 78438 },
          { name: 'Marketing', employees: 28, basePay: 65200, overtime: 1890, deductions: 9780, netPay: 57310 },
          { name: 'HR & Admin', employees: 18, basePay: 52300, overtime: 200, deductions: 7845, netPay: 44655 },
        ],
        employeePayroll: [
          { id: 1, name: 'Michael Chen', position: 'Senior Developer', basic: 5800, overtime: 420, allowances: 300, deductions: 1240, netPay: 5280, status: 'approved' },
          { id: 2, name: 'Sarah Johnson', position: 'HR Manager', basic: 6200, overtime: 0, allowances: 400, deductions: 1480, netPay: 5120, status: 'pending' },
        ],
        history: [
          { period: 'December 1-15, 2023', employees: 247, totalNetPay: 284750, processedDate: 'Dec 16, 2023', status: 'completed' },
          { period: 'November 16-30, 2023', employees: 245, totalNetPay: 270580, processedDate: 'Dec 1, 2023', status: 'completed' },
        ]
      }
    }
  })

  const chartData = {
    labels: payrollData?.departments?.map((d: any) => d.name) || [],
    datasets: [{
      label: 'Net Pay',
      data: payrollData?.departments?.map((d: any) => d.netPay) || [],
      backgroundColor: 'rgba(20, 184, 166, 0.6)',
      borderColor: 'rgba(20, 184, 166, 1)',
      borderWidth: 2,
    }],
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
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Payroll & Finance — Intelligent Financial Management
            </h2>
            <p className="mt-1 text-sm md:text-base text-gray-600 dark:text-gray-300">
              Process cycles, structures, payslips, and analytics in one place.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl glass text-xs">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500" title="Online"></span>
              <span>Online</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Welcome, Admin</div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center font-semibold">A</div>
          </div>
        </div>
      </header>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass rounded-2xl p-6 shadow hover:shadow-glow transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Payroll This Month</p>
              <h3 className="text-2xl font-extrabold mt-1">${payrollData?.totalPayroll?.toLocaleString() || '284,750'}</h3>
              <p className="text-xs text-green-600 mt-2 flex items-center">
                <iconify-icon icon="ph:arrow-up-right-duotone" className="mr-1"></iconify-icon>
                5.2% increase
              </p>
            </div>
            <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg text-white">
              <iconify-icon icon="ph:currency-dollar-duotone" className="text-xl"></iconify-icon>
            </div>
          </div>
        </div>
        <div className="glass rounded-2xl p-6 shadow hover:shadow-glow transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending Approval</p>
              <h3 className="text-2xl font-extrabold mt-1">${payrollData?.pendingApproval?.toLocaleString() || '152,430'}</h3>
              <p className="text-xs text-yellow-600 mt-2 flex items-center">
                <iconify-icon icon="ph:clock-duotone" className="mr-1"></iconify-icon>
                Awaiting review
              </p>
            </div>
            <div className="p-3 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl shadow-lg text-white">
              <iconify-icon icon="ph:hourglass-duotone" className="text-xl"></iconify-icon>
            </div>
          </div>
        </div>
        <div className="glass rounded-2xl p-6 shadow hover:shadow-glow transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Overtime Costs</p>
              <h3 className="text-2xl font-extrabold mt-1">${payrollData?.overtimeCosts?.toLocaleString() || '12,480'}</h3>
              <p className="text-xs text-red-600 mt-2 flex items-center">
                <iconify-icon icon="ph:warning-circle-duotone" className="mr-1"></iconify-icon>
                18% over budget
              </p>
            </div>
            <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg text-white">
              <iconify-icon icon="ph:clock-afternoon-duotone" className="text-xl"></iconify-icon>
            </div>
          </div>
        </div>
        <div className="glass rounded-2xl p-6 shadow hover:shadow-glow transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tax Deductions</p>
              <h3 className="text-2xl font-extrabold mt-1">${payrollData?.taxDeductions?.toLocaleString() || '42,150'}</h3>
              <p className="text-xs text-blue-600 mt-2 flex items-center">
                <iconify-icon icon="ph:percent-duotone" className="mr-1"></iconify-icon>
                14.8% of payroll
              </p>
            </div>
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg text-white">
              <iconify-icon icon="ph:receipt-duotone" className="text-xl"></iconify-icon>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Wrapper */}
      <div className="glass rounded-2xl shadow overflow-hidden">
        <div className="border-b border-white/40 dark:border-white/10 overflow-x-auto">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('processing')}
              className={`py-4 px-6 text-center border-b-2 font-medium flex items-center whitespace-nowrap ${
                activeTab === 'processing'
                  ? 'border-amber-500 text-amber-500 dark:text-amber-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <iconify-icon icon="ph:calculator-duotone" className="mr-2"></iconify-icon>
              Payroll Processing
            </button>
            <button
              onClick={() => setActiveTab('structure')}
              className={`py-4 px-6 text-center border-b-2 font-medium flex items-center whitespace-nowrap ${
                activeTab === 'structure'
                  ? 'border-amber-500 text-amber-500 dark:text-amber-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <iconify-icon icon="ph:gear-duotone" className="mr-2"></iconify-icon>
              Salary Structure
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-6 text-center border-b-2 font-medium flex items-center whitespace-nowrap ${
                activeTab === 'history'
                  ? 'border-amber-500 text-amber-500 dark:text-amber-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <iconify-icon icon="ph:clock-counter-clockwise-duotone" className="mr-2"></iconify-icon>
              Payroll History
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-6 text-center border-b-2 font-medium flex items-center whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'border-amber-500 text-amber-500 dark:text-amber-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <iconify-icon icon="ph:chart-line-up-duotone" className="mr-2"></iconify-icon>
              Financial Dashboard
            </button>
            <button
              onClick={() => setActiveTab('payslips')}
              className={`py-4 px-6 text-center border-b-2 font-medium flex items-center whitespace-nowrap ${
                activeTab === 'payslips'
                  ? 'border-amber-500 text-amber-500 dark:text-amber-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <iconify-icon icon="ph:file-text-duotone" className="mr-2"></iconify-icon>
              Payslips
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Payroll Processing Content */}
          {activeTab === 'processing' && (
            <div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold">Payroll Cycle: {selectedPeriod}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Process payroll for 247 employees | Cycle ends: Dec 31, 2023
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
                  <button className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg flex items-center shadow-lg transition-all duration-300 hover:scale-105">
                    <iconify-icon icon="ph:play-circle-duotone" className="mr-2"></iconify-icon>
                    Run Payroll
                  </button>
                  <button className="px-4 py-2 bg-white dark:bg-gray-700 border border-white/30 dark:border-gray-700/60 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg flex items-center shadow-md transition-all duration-300 hover:scale-105">
                    <iconify-icon icon="ph:export-duotone" className="mr-2"></iconify-icon>
                    Export
                  </button>
                  <button className="px-4 py-2 bg-white dark:bg-gray-700 border border-white/30 dark:border-gray-700/60 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg flex items-center shadow-md transition-all duration-300 hover:scale-105">
                    <iconify-icon icon="ph:tray-arrow-down-duotone" className="mr-2"></iconify-icon>
                    Import Data
                  </button>
                  <button className="px-4 py-2 bg-white dark:bg-gray-700 border border-white/30 dark:border-gray-700/60 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg flex items-center shadow-md transition-all duration-300 hover:scale-105">
                    <iconify-icon icon="ph:robot-duotone" className="mr-2"></iconify-icon>
                    AI Validate
                  </button>
                </div>
              </div>

              {/* Payroll Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 glass rounded-xl p-6 border border-white/30 dark:border-gray-700/60">
                  <h3 className="text-lg font-semibold mb-4">Payroll Summary</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700/60">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Department</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Employees</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Base Pay</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Overtime</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Deductions</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Net Pay</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {payrollData?.departments?.map((dept: any, idx: number) => (
                          <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{dept.name}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{dept.employees}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">${dept.basePay.toLocaleString()}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-green-500">${dept.overtime.toLocaleString()}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-red-500">${dept.deductions.toLocaleString()}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold">${dept.netPay.toLocaleString()}</td>
                          </tr>
                        ))}
                        <tr className="bg-gray-50 dark:bg-gray-700/60">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-bold">Total</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-bold">
                            {payrollData?.departments?.reduce((sum: number, d: any) => sum + d.employees, 0) || 156}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-bold">
                            ${payrollData?.departments?.reduce((sum: number, d: any) => sum + d.basePay, 0).toLocaleString() || '349,750'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-green-500">
                            ${payrollData?.departments?.reduce((sum: number, d: any) => sum + d.overtime, 0).toLocaleString() || '12,480'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-red-500">
                            ${payrollData?.departments?.reduce((sum: number, d: any) => sum + d.deductions, 0).toLocaleString() || '52,462'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-bold">
                            ${payrollData?.departments?.reduce((sum: number, d: any) => sum + d.netPay, 0).toLocaleString() || '309,768'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="glass rounded-xl p-6 border border-white/30 dark:border-gray-700/60">
                  <h3 className="text-lg font-semibold mb-4">Approval Workflow</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg border border-amber-200 dark:border-amber-700">
                      <div className="flex items-center">
                        <div className="p-2 bg-amber-100 dark:bg-amber-800 rounded-lg mr-3">
                          <iconify-icon icon="ph:user-check-duotone" className="text-amber-500"></iconify-icon>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Department Heads</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Initial approval</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs rounded-full">Completed</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg mr-3">
                          <iconify-icon icon="ph:users-four-duotone" className="text-blue-500"></iconify-icon>
                        </div>
                        <div>
                          <p className="text-sm font-medium">HR Manager</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Policy compliance</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 text-xs rounded-full">In Progress</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center">
                        <div className="p-2 bg-gray-100 dark:bg-gray-600 rounded-lg mr-3">
                          <iconify-icon icon="ph:receipt-duotone" className="text-gray-500"></iconify-icon>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Finance Director</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Final approval</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 text-xs rounded-full">Pending</span>
                    </div>
                    <div className="pt-2">
                      <button className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-105">
                        <iconify-icon icon="ph:check-circle-duotone" className="mr-2"></iconify-icon>
                        Approve & Proceed
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Employee Payroll Details */}
              <div className="glass rounded-xl overflow-hidden border border-white/30 dark:border-gray-700/60 mb-6">
                <div className="px-6 py-4 border-b border-white/30 dark:border-gray-700/60 flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Employee Payroll Details</h3>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm flex items-center">
                      <iconify-icon icon="ph:sliders-horizontal-duotone" className="mr-1"></iconify-icon>
                      Filter
                    </button>
                    <button className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm flex items-center">
                      <iconify-icon icon="ph:magnifying-glass-duotone" className="mr-1"></iconify-icon>
                      Search
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/60">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Employee</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Basic Salary</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Overtime</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Allowances</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Deductions</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Net Pay</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {payrollData?.employeePayroll?.map((emp: any) => (
                        <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                                  {emp.name.charAt(0)}
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium">{emp.name}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{emp.position}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${emp.basic.toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-500">${emp.overtime.toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-500">${emp.allowances.toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500">${emp.deductions.toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">${emp.netPay.toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              emp.status === 'approved'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }`}>
                              {emp.status === 'approved' ? 'Approved' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-lg transition-all duration-300 hover:scale-105">
                                <iconify-icon icon="ph:eye-duotone" className="mr-1"></iconify-icon>
                                View
                              </button>
                              <button className="text-amber-600 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300 bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-lg transition-all duration-300 hover:scale-105">
                                <iconify-icon icon="ph:pencil-simple-duotone" className="mr-1"></iconify-icon>
                                Adjust
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Salary Structure Content */}
          {activeTab === 'structure' && (
            <div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold">Salary Structure Configuration</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Define payroll components, allowances, and deductions by department or position
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
                  <button className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg flex items-center shadow-lg transition-all duration-300 hover:scale-105">
                    <iconify-icon icon="ph:plus-circle-duotone" className="mr-2"></iconify-icon>
                    New Structure
                  </button>
                  <button className="px-4 py-2 bg-white dark:bg-gray-700 border border-white/30 dark:border-gray-700/60 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg flex items-center shadow-md transition-all duration-300 hover:scale-105">
                    <iconify-icon icon="ph:copy-duotone" className="mr-2"></iconify-icon>
                    Duplicate
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="glass rounded-xl p-6 border border-white/30 dark:border-gray-700/60">
                  <h3 className="text-lg font-semibold mb-4">Position-based Structures</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Senior Developer</h4>
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded-full">Engineering</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-gray-600 dark:text-gray-400">Basic Salary:</div>
                        <div className="font-medium">$5,800</div>
                        <div className="text-gray-600 dark:text-gray-400">Housing Allowance:</div>
                        <div className="font-medium text-green-600 dark:text-green-400">$300</div>
                        <div className="text-gray-600 dark:text-gray-400">Overtime Rate:</div>
                        <div className="font-medium text-green-600 dark:text-green-400">1.5x</div>
                      </div>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-700">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">HR Manager</h4>
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 text-xs rounded-full">Human Resources</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-gray-600 dark:text-gray-400">Basic Salary:</div>
                        <div className="font-medium">$6,200</div>
                        <div className="text-gray-600 dark:text-gray-400">Transport Allowance:</div>
                        <div className="font-medium text-green-600 dark:text-green-400">$200</div>
                        <div className="text-gray-600 dark:text-gray-400">Overtime Rate:</div>
                        <div className="font-medium text-green-600 dark:text-green-400">1.2x</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="glass rounded-xl p-6 border border-white/30 dark:border-gray-700/60">
                  <h3 className="text-lg font-semibold mb-4">Deduction Rules</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-700">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Tax Withholding</h4>
                        <span className="px-2 py-1 bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 text-xs rounded-full">Mandatory</span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Progressive tax rates based on income brackets. Automatically calculated using current tax tables.
                      </div>
                    </div>
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-700">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Social Security</h4>
                        <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 text-xs rounded-full">Mandatory</span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        6.2% of first $147,000 of earnings. Employer matches contribution.
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Health Insurance</h4>
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs rounded-full">Voluntary</span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        $250 monthly premium. 70% employer subsidized.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass rounded-xl p-6 border border-white/30 dark:border-gray-700/60">
                <h3 className="text-lg font-semibold mb-4">Salary Components</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/60">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Component</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Calculation Basis</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Rate/Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Applicable To</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">Basic Salary</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Earnings</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Monthly Fixed</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Position-based</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">All Employees</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</span>
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">Housing Allowance</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Allowance</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Monthly Fixed</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$300</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Manager & Above</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</span>
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">Overtime</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Earnings</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Hourly Rate</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1.5x Base Rate</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Non-Exempt</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Payroll History Content */}
          {activeTab === 'history' && (
            <div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold">Payroll History & Audit Trail</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Complete record of all payroll batches, adjustments, and approver actions
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
                  <button className="px-4 py-2 bg-white dark:bg-gray-700 border border-white/30 dark:border-gray-700/60 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg flex items-center shadow-md transition-all duration-300 hover:scale-105">
                    <iconify-icon icon="ph:download-simple-duotone" className="mr-2"></iconify-icon>
                    Export History
                  </button>
                  <button className="px-4 py-2 bg-white dark:bg-gray-700 border border-white/30 dark:border-gray-700/60 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg flex items-center shadow-md transition-all duration-300 hover:scale-105">
                    <iconify-icon icon="ph:sliders-duotone" className="mr-2"></iconify-icon>
                    Filter
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 glass rounded-xl p-6 border border-white/30 dark:border-gray-700/60">
                  <h3 className="text-lg font-semibold mb-4">Recent Payroll Cycles</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700/60">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Payroll Period</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Employees</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Total Net Pay</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Processed Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {payrollData?.history?.map((item: any, idx: number) => (
                          <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{item.period}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.employees}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold">${item.totalNetPay.toLocaleString()}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.processedDate}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                {item.status === 'completed' ? 'Completed' : 'Pending'}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                              <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                                <iconify-icon icon="ph:eye-duotone"></iconify-icon>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="glass rounded-xl p-6 border border-white/30 dark:border-gray-700/60">
                  <h3 className="text-lg font-semibold mb-4">Payroll Statistics</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-medium">Total Processed (2023)</p>
                        <iconify-icon icon="ph:currency-circle-dollar-duotone" className="text-blue-500"></iconify-icon>
                      </div>
                      <p className="text-2xl font-bold">$3.2M</p>
                      <p className="text-xs text-green-600 mt-1 flex items-center">
                        <iconify-icon icon="ph:arrow-up-right-duotone" className="mr-1"></iconify-icon>
                        12.5% increase from 2022
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-medium">Average Processing Time</p>
                        <iconify-icon icon="ph:clock-duotone" className="text-green-500"></iconify-icon>
                      </div>
                      <p className="text-2xl font-bold">2.3 days</p>
                      <p className="text-xs text-green-600 mt-1 flex items-center">
                        <iconify-icon icon="ph:arrow-down-left-duotone" className="mr-1"></iconify-icon>
                        18% faster than last year
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-medium">Error Rate</p>
                        <iconify-icon icon="ph:warning-octagon-duotone" className="text-purple-500"></iconify-icon>
                      </div>
                      <p className="text-2xl font-bold">0.4%</p>
                      <p className="text-xs text-green-600 mt-1 flex items-center">
                        <iconify-icon icon="ph:arrow-down-left-duotone" className="mr-1"></iconify-icon>
                        62% reduction from last year
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="glass rounded-xl p-6 border border-white/30 dark:border-gray-700/60">
                <h3 className="text-lg font-semibold mb-4">Payroll Audit Trail</h3>
                <div className="space-y-4">
                  <div className="flex items-start border-l-4 border-blue-500 pl-4 py-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mr-3">
                      <iconify-icon icon="ph:user-check-duotone" className="text-blue-500 text-sm"></iconify-icon>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Payroll approved by Finance Director</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">December payroll batch for 247 employees</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Dec 16, 2023 • 10:30 AM • Robert Chen</p>
                    </div>
                  </div>
                  <div className="flex items-start border-l-4 border-green-500 pl-4 py-2">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg mr-3">
                      <iconify-icon icon="ph:calculator-duotone" className="text-green-500 text-sm"></iconify-icon>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Overtime calculations updated</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Adjusted overtime for Engineering department</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Dec 15, 2023 • 3:45 PM • Sarah Johnson</p>
                    </div>
                  </div>
                  <div className="flex items-start border-l-4 border-amber-500 pl-4 py-2">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg mr-3">
                      <iconify-icon icon="ph:warning-duotone" className="text-amber-500 text-sm"></iconify-icon>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Payroll discrepancies detected</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">3 employees had missing attendance records</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Dec 15, 2023 • 11:20 AM • System</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Financial Dashboard Content */}
          {activeTab === 'dashboard' && (
            <div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold">Financial Dashboard</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Comprehensive financial analytics and cost breakdowns
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
                  <button className="px-4 py-2 bg-white dark:bg-gray-700 border border-white/30 dark:border-gray-700/60 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg flex items-center shadow-md transition-all duration-300 hover:scale-105">
                    <iconify-icon icon="ph:download-simple-duotone" className="mr-2"></iconify-icon>
                    Export PDF
                  </button>
                  <button className="px-4 py-2 bg-white dark:bg-gray-700 border border-white/30 dark:border-gray-700/60 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg flex items-center shadow-md transition-all duration-300 hover:scale-105">
                    <iconify-icon icon="ph:calendar-duotone" className="mr-2"></iconify-icon>
                    Date Range
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass rounded-xl p-6 border border-white/30 dark:border-gray-700/60">
                  <h3 className="text-lg font-semibold mb-4">Payroll Cost Trend</h3>
                  <div className="h-64">
                    <Line
                      data={{
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                        datasets: [{
                          label: 'Total Payroll',
                          data: [240000, 245000, 250000, 255000, 260000, 265000, 270000, 275000, 280000, 275000, 270000, 285000],
                          borderColor: 'rgba(20, 184, 166, 1)',
                          backgroundColor: 'rgba(20, 184, 166, 0.1)',
                          tension: 0.4,
                        }],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
                        },
                      }}
                    />
                  </div>
                </div>
                <div className="glass rounded-xl p-6 border border-white/30 dark:border-gray-700/60">
                  <h3 className="text-lg font-semibold mb-4">Cost Distribution</h3>
                  <div className="h-64">
                    <Pie
                      data={{
                        labels: ['Base Salary', 'Overtime', 'Allowances', 'Benefits'],
                        datasets: [{
                          data: [75, 8, 5, 12],
                          backgroundColor: [
                            'rgba(20, 184, 166, 0.8)',
                            'rgba(59, 130, 246, 0.8)',
                            'rgba(245, 158, 11, 0.8)',
                            'rgba(239, 68, 68, 0.8)',
                          ],
                        }],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: 'bottom' },
                        },
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payslips Content */}
          {activeTab === 'payslips' && (
            <div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold">Employee Payslips</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Generate, view, and manage employee payslips
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
                  <button className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg flex items-center shadow-lg transition-all duration-300 hover:scale-105">
                    <iconify-icon icon="ph:file-plus-duotone" className="mr-2"></iconify-icon>
                    Generate Payslips
                  </button>
                  <button className="px-4 py-2 bg-white dark:bg-gray-700 border border-white/30 dark:border-gray-700/60 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg flex items-center shadow-md transition-all duration-300 hover:scale-105">
                    <iconify-icon icon="ph:download-simple-duotone" className="mr-2"></iconify-icon>
                    Bulk Download
                  </button>
                </div>
              </div>
              <div className="glass rounded-xl p-6 border border-white/30 dark:border-gray-700/60">
                <div className="flex items-center justify-between mb-4">
                  <input
                    type="text"
                    placeholder="Search employee..."
                    className="px-4 py-2 rounded-lg border border-white/30 dark:border-gray-700/60 bg-white/50 dark:bg-gray-800/50"
                  />
                  <select className="px-4 py-2 rounded-lg border border-white/30 dark:border-gray-700/60 bg-white/50 dark:bg-gray-800/50">
                    <option>All Periods</option>
                    <option>December 2023</option>
                    <option>November 2023</option>
                  </select>
                </div>
                <div className="space-y-3">
                  {payrollData?.employeePayroll?.map((emp: any) => (
                    <div key={emp.id} className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-white/30 dark:border-gray-700/60 hover:shadow-md transition">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{emp.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{emp.position}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${emp.netPay.toLocaleString()}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{selectedPeriod}</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-sm hover:bg-blue-100 dark:hover:bg-blue-900/50 transition">
                            <iconify-icon icon="ph:eye-duotone" className="mr-1"></iconify-icon>
                            View
                          </button>
                          <button className="px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg text-sm hover:bg-green-100 dark:hover:bg-green-900/50 transition">
                            <iconify-icon icon="ph:download-duotone" className="mr-1"></iconify-icon>
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
