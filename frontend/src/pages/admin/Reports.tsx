import { useState } from 'react'
import Clock from '../../components/common/Clock'
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
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2'

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

export default function Reports() {
  const [activeTab, setActiveTab] = useState('report-builder')

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  }

  const attendanceTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Attendance Rate',
      data: [92, 94, 93, 95, 96, 94],
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.3,
      fill: true
    }]
  }

  const departmentComparisonData = {
    labels: ['Engineering', 'Sales', 'Marketing', 'HR'],
    datasets: [{
      label: 'Attendance',
      data: [96.2, 92.1, 89.4, 94.7],
      backgroundColor: '#3b82f6',
    }]
  }

  const costDistributionData = {
    labels: ['Base Salary', 'Overtime', 'Bonuses', 'Benefits'],
    datasets: [{
      data: [65, 15, 12, 8],
      backgroundColor: ['#10b981', '#f59e0b', '#8b5cf6', '#ef4444'],
    }]
  }

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <header className="relative overflow-hidden rounded-3xl glass p-6 md:p-8 shadow-glow">
        <div className="absolute inset-0 opacity-40 animate-shine" style={{
          backgroundImage: 'linear-gradient(90deg, var(--accent), rgba(255,255,255,0.2), var(--accent))',
          backgroundSize: '200% 100%',
        }}></div>
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Reports & Exports — Comprehensive Analytics
          </h2>
          <p className="mt-1 text-sm md:text-base text-gray-600 dark:text-gray-300">
              Generate, schedule, and export comprehensive reports with custom metrics and visualizations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl glass text-xs">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500" title="Online"></span>
              <Clock />
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Welcome, Admin</div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center font-semibold">A</div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-2xl p-4 shadow transition hover:shadow-lg hover-lift">
          <div className="text-xs text-gray-500 dark:text-gray-400">Total Reports Generated</div>
          <div className="mt-1 text-3xl font-extrabold">1,247</div>
          <div className="text-sm text-green-500 flex items-center gap-1">
            <iconify-icon icon="ph:trend-up-duotone"></iconify-icon>
            <span>+12% this month</span>
          </div>
        </div>
        
        <div className="glass rounded-2xl p-4 shadow transition hover:shadow-lg hover-lift">
          <div className="text-xs text-gray-500 dark:text-gray-400">Scheduled Reports</div>
          <div className="mt-1 text-3xl font-extrabold">28</div>
          <div className="text-sm text-blue-500 flex items-center gap-1">
            <iconify-icon icon="ph:clock-duotone"></iconify-icon>
            <span>Active schedules</span>
          </div>
        </div>
        
        <div className="glass rounded-2xl p-4 shadow transition hover:shadow-lg hover-lift">
          <div className="text-xs text-gray-500 dark:text-gray-400">Export Formats</div>
          <div className="mt-1 text-3xl font-extrabold">5</div>
          <div className="text-sm text-purple-500 flex items-center gap-1">
            <iconify-icon icon="ph:file-duotone"></iconify-icon>
            <span>PDF, Excel, CSV, JSON, XML</span>
          </div>
        </div>
        
        <div className="glass rounded-2xl p-4 shadow transition hover:shadow-lg hover-lift">
          <div className="text-xs text-gray-500 dark:text-gray-400">Last Export</div>
          <div className="mt-1 text-2xl font-extrabold">2h ago</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <iconify-icon icon="ph:check-circle-duotone"></iconify-icon>
            <span>Successfully completed</span>
          </div>
        </div>
      </div>

      {/* Tabs Wrapper */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-2xl shadow-xl border border-white/30 dark:border-gray-700/60 overflow-hidden">
        <div className="border-b border-white/30 dark:border-gray-700/60 overflow-x-auto">
          <nav className="flex -mb-px">
            <button
              className={`py-4 px-6 text-center border-b-2 ${activeTab === 'report-builder' ? 'border-amber-500 text-amber-500 dark:text-amber-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'} font-medium flex items-center whitespace-nowrap`}
              onClick={() => setActiveTab('report-builder')}
            >
              <iconify-icon icon="ph:file-text-duotone" className="mr-2"></iconify-icon>
              Report Builder
            </button>
            <button
              className={`py-4 px-6 text-center border-b-2 ${activeTab === 'scheduled' ? 'border-amber-500 text-amber-500 dark:text-amber-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'} font-medium flex items-center whitespace-nowrap`}
              onClick={() => setActiveTab('scheduled')}
            >
              <iconify-icon icon="ph:clock-countdown-duotone" className="mr-2"></iconify-icon>
              Scheduled Reports
            </button>
            <button
              className={`py-4 px-6 text-center border-b-2 ${activeTab === 'templates' ? 'border-amber-500 text-amber-500 dark:text-amber-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'} font-medium flex items-center whitespace-nowrap`}
              onClick={() => setActiveTab('templates')}
            >
              <iconify-icon icon="ph:folder-duotone" className="mr-2"></iconify-icon>
              Report Templates
            </button>
            <button
              className={`py-4 px-6 text-center border-b-2 ${activeTab === 'exports' ? 'border-amber-500 text-amber-500 dark:text-amber-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'} font-medium flex items-center whitespace-nowrap`}
              onClick={() => setActiveTab('exports')}
            >
              <iconify-icon icon="ph:download-duotone" className="mr-2"></iconify-icon>
              Export History
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Report Builder Content */}
          {activeTab === 'report-builder' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-xl font-bold">Custom Report Builder</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Create custom reports by selecting metrics, filters, date ranges, and visualization styles</p>
                </div>
                <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
                  <button className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-lg flex items-center shadow-lg transition-all duration-300 transform hover:scale-105">
                    <iconify-icon icon="ph:plus-duotone" className="mr-2"></iconify-icon>
                    New Report
                  </button>
                  <button className="px-4 py-2 glass border border-white/30 dark:border-gray-700/60 text-gray-700 dark:text-gray-300 hover:shadow-glow rounded-lg flex items-center transition-all duration-300 hover:scale-105">
                    <iconify-icon icon="ph:floppy-disk-duotone" className="mr-2"></iconify-icon>
                    Save Template
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass rounded-xl shadow p-6 border border-white/30 dark:border-gray-700/60">
                  <h3 className="text-lg font-semibold mb-4">Report Configuration</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Report Name</label>
                      <input type="text" className="w-full rounded-lg glass border border-white/30 dark:border-gray-700/60 shadow-sm focus:border-amber-500 focus:ring-amber-500 p-2" placeholder="Enter report name..." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Select Metrics</label>
                      <div className="grid grid-cols-2 gap-3">
                        {['Attendance Rate', 'Overtime Hours', 'Leave Utilization', 'Productivity', 'Payroll Costs', 'Turnover Rate'].map((metric) => (
                          <label key={metric} className="flex items-center p-3 glass rounded-lg border border-white/30 dark:border-gray-700/60 cursor-pointer hover:shadow-glow transition">
                            <input type="checkbox" className="mr-3" />
                            <span className="text-sm">{metric}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Date Range</label>
                        <select className="block w-full rounded-lg glass border border-white/30 dark:border-gray-700/60 shadow-sm focus:border-amber-500 focus:ring-amber-500 p-2">
                          <option>Last 7 days</option>
                          <option>Last 30 days</option>
                          <option>Last quarter</option>
                          <option>Last year</option>
                          <option>Custom range</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Employee Type</label>
                        <select className="block w-full rounded-lg glass border border-white/30 dark:border-gray-700/60 shadow-sm focus:border-amber-500 focus:ring-amber-500 p-2">
                          <option>All Employees</option>
                          <option>Full-time</option>
                          <option>Part-time</option>
                          <option>Contract</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Departments</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['Engineering', 'Sales', 'Marketing', 'HR & Admin'].map((dept) => (
                          <label key={dept} className="flex items-center cursor-pointer">
                            <input type="checkbox" className="mr-2" />
                            <span className="text-sm">{dept}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Visualization Style</label>
                      <div className="flex space-x-4">
                        <button className="flex-1 px-4 py-3 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-lg flex flex-col items-center justify-center border-2 border-indigo-300 dark:border-indigo-700">
                          <iconify-icon icon="ph:chart-bar-duotone" className="text-xl mb-2"></iconify-icon>
                          <span className="text-sm">Bar Chart</span>
                        </button>
                        <button className="flex-1 px-4 py-3 glass rounded-lg flex flex-col items-center justify-center border border-white/30 dark:border-gray-700/60 text-gray-700 dark:text-gray-300">
                          <iconify-icon icon="ph:chart-line-duotone" className="text-xl mb-2"></iconify-icon>
                          <span className="text-sm">Line Chart</span>
                        </button>
                        <button className="flex-1 px-4 py-3 glass rounded-lg flex flex-col items-center justify-center border border-white/30 dark:border-gray-700/60 text-gray-700 dark:text-gray-300">
                          <iconify-icon icon="ph:chart-pie-duotone" className="text-xl mb-2"></iconify-icon>
                          <span className="text-sm">Pie Chart</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="glass rounded-xl shadow p-6 border border-white/30 dark:border-gray-700/60">
                  <h3 className="text-lg font-semibold mb-4">Report Preview & Export</h3>
                  <div className="space-y-4">
                    <div className="p-4 glass rounded-lg border border-white/30 dark:border-gray-700/60">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-medium">Report Summary</p>
                        <iconify-icon icon="ph:file-duotone" className="text-gray-500"></iconify-icon>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">5 metrics selected across 3 departments for Q4 2023</p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Export Options</p>
                        <iconify-icon icon="ph:download-duotone" className="text-blue-500"></iconify-icon>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <button className="px-3 py-2 glass border border-white/30 dark:border-gray-700/60 rounded text-xs flex items-center justify-center">
                          <iconify-icon icon="ph:file-pdf-duotone" className="mr-1"></iconify-icon> PDF
                        </button>
                        <button className="px-3 py-2 glass border border-white/30 dark:border-gray-700/60 rounded text-xs flex items-center justify-center">
                          <iconify-icon icon="ph:file-xls-duotone" className="mr-1"></iconify-icon> Excel
                        </button>
                        <button className="px-3 py-2 glass border border-white/30 dark:border-gray-700/60 rounded text-xs flex items-center justify-center">
                          <iconify-icon icon="ph:file-csv-duotone" className="mr-1"></iconify-icon> CSV
                        </button>
                        <button className="px-3 py-2 glass border border-white/30 dark:border-gray-700/60 rounded text-xs flex items-center justify-center">
                          <iconify-icon icon="ph:share-network-duotone" className="mr-1"></iconify-icon> Share
                        </button>
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Schedule Report</p>
                        <iconify-icon icon="ph:clock-duotone" className="text-green-500"></iconify-icon>
                      </div>
                      <div className="flex space-x-2 mt-3">
                        <select className="flex-1 px-2 py-1 glass border border-white/30 dark:border-gray-700/60 rounded text-xs text-gray-700 dark:text-gray-300">
                          <option>Never</option>
                          <option>Daily</option>
                          <option>Weekly</option>
                          <option>Monthly</option>
                        </select>
                        <button className="px-3 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 rounded text-xs">Set</button>
                      </div>
                    </div>
                    <button className="w-full px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-lg flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-105">
                      <iconify-icon icon="ph:play-duotone" className="mr-2"></iconify-icon>
                      Generate Report
                    </button>
                  </div>
                </div>
              </div>

              {/* Preview Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass rounded-xl shadow p-6 border border-white/30 dark:border-gray-700/60">
                  <h3 className="text-lg font-semibold mb-4">Attendance Trends</h3>
                  <div className="h-64">
                    <Line data={attendanceTrendData} options={chartOptions} />
                  </div>
                </div>
                <div className="glass rounded-xl shadow p-6 border border-white/30 dark:border-gray-700/60">
                  <h3 className="text-lg font-semibold mb-4">Department Comparison</h3>
                  <div className="h-64">
                    <Bar data={departmentComparisonData} options={chartOptions} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Scheduled Reports Content */}
          {activeTab === 'scheduled' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-xl font-bold">Scheduled Reports</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage automated report generation and delivery schedules</p>
                </div>
                <button className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-lg flex items-center shadow-lg transition-all duration-300 transform hover:scale-105 mt-4 md:mt-0">
                  <iconify-icon icon="ph:plus-duotone" className="mr-2"></iconify-icon>
                  New Schedule
                </button>
              </div>

              <div className="glass rounded-xl shadow overflow-hidden border border-white/30 dark:border-gray-700/60">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-white/30 dark:divide-gray-700/60">
                    <thead className="glass">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Report Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Frequency</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Recipients</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Next Run</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/30 dark:divide-gray-700/60">
                      <tr className="hover:bg-white/60 dark:hover:bg-gray-700/60 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">Monthly Attendance Report</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Monthly</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">5 recipients</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Dec 1, 2024</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">Edit</button>
                            <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Delete</button>
                          </div>
                        </td>
                      </tr>
                      <tr className="hover:bg-white/60 dark:hover:bg-gray-700/60 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">Weekly Payroll Summary</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Weekly</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">3 recipients</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Nov 25, 2024</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">Edit</button>
                            <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Delete</button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Report Templates Content */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-xl font-bold">Report Templates</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Reusable report configurations for quick generation</p>
                </div>
                <button className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-lg flex items-center shadow-lg transition-all duration-300 transform hover:scale-105 mt-4 md:mt-0">
                  <iconify-icon icon="ph:plus-duotone" className="mr-2"></iconify-icon>
                  New Template
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { name: 'Attendance Summary', metrics: 5, lastUsed: '2 days ago' },
                  { name: 'Payroll Analysis', metrics: 8, lastUsed: '1 week ago' },
                  { name: 'Leave Report', metrics: 4, lastUsed: '3 days ago' },
                  { name: 'Department Performance', metrics: 6, lastUsed: '5 days ago' },
                  { name: 'Overtime Analysis', metrics: 3, lastUsed: '1 day ago' },
                  { name: 'Employee Statistics', metrics: 7, lastUsed: '4 days ago' },
                ].map((template, idx) => (
                  <div key={idx} className="glass rounded-xl shadow p-6 border border-white/30 dark:border-gray-700/60 hover:shadow-glow transition">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-semibold">{template.name}</h4>
                      <iconify-icon icon="ph:file-text-duotone" className="text-2xl text-gray-400"></iconify-icon>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex justify-between">
                        <span>Metrics:</span>
                        <span className="font-medium">{template.metrics}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Used:</span>
                        <span className="font-medium">{template.lastUsed}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <button className="flex-1 px-3 py-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-lg text-sm hover:bg-indigo-200 dark:hover:bg-indigo-800 transition">
                        Use Template
                      </button>
                      <button className="px-3 py-2 glass border border-white/30 dark:border-gray-700/60 rounded-lg text-sm hover:shadow-glow transition">
                        <iconify-icon icon="ph:pencil-duotone"></iconify-icon>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Export History Content */}
          {activeTab === 'exports' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-xl font-bold">Export History</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">View and manage all exported reports</p>
                </div>
                <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
                  <button className="px-4 py-2 glass border border-white/30 dark:border-gray-700/60 text-gray-700 dark:text-gray-300 hover:shadow-glow rounded-lg flex items-center transition-all duration-300 hover:scale-105">
                    <iconify-icon icon="ph:download-duotone" className="mr-2"></iconify-icon>
                    Bulk Download
                  </button>
                  <button className="px-4 py-2 glass border border-white/30 dark:border-gray-700/60 text-gray-700 dark:text-gray-300 hover:shadow-glow rounded-lg flex items-center transition-all duration-300 hover:scale-105">
                    <iconify-icon icon="ph:trash-duotone" className="mr-2"></iconify-icon>
                    Clear History
                  </button>
                </div>
              </div>

              <div className="glass rounded-xl shadow overflow-hidden border border-white/30 dark:border-gray-700/60">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-white/30 dark:divide-gray-700/60">
                    <thead className="glass">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Report Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Format</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Size</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Exported</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/30 dark:divide-gray-700/60">
                      <tr className="hover:bg-white/60 dark:hover:bg-gray-700/60 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">Monthly Attendance Report</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">PDF</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">2.4 MB</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">2 hours ago</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">Download</button>
                            <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Delete</button>
                          </div>
                        </td>
                      </tr>
                      <tr className="hover:bg-white/60 dark:hover:bg-gray-700/60 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">Payroll Summary Q4</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Excel</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">1.8 MB</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">1 day ago</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">Download</button>
                            <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Delete</button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
