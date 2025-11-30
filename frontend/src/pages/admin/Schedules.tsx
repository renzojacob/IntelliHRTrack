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
import { Bar, Pie } from 'react-chartjs-2'

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

export default function Schedules() {
  const [activeTab, setActiveTab] = useState('calendar')
  const [selectedWeek, setSelectedWeek] = useState('Nov 27 - Dec 3')

  const { data: scheduleData } = useQuery('schedules', async () => {
    try {
      const response = await api.get('/api/v1/schedules')
      return response.data
    } catch {
      return {
        shiftsThisWeek: 342,
        conflicts: 3,
        swapRequests: 12,
        aiSuggestions: 7,
        employees: [
          { id: 1, name: 'Michael Chen', department: 'Engineering', photo: '' },
          { id: 2, name: 'Sarah Johnson', department: 'HR', photo: '' },
        ],
        schedules: [
          { employeeId: 1, day: 'Mon', shift: 'Morning', time: '8:00-17:00' },
          { employeeId: 1, day: 'Tue', shift: 'Morning', time: '8:00-17:00' },
          { employeeId: 1, day: 'Wed', shift: 'Day Off', time: 'Requested' },
        ]
      }
    }
  })

  const distributionChartData = {
    labels: ['Morning', 'Evening', 'Night', 'Day Off'],
    datasets: [{
      data: [180, 95, 45, 22],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(16, 185, 129, 0.8)',
      ],
    }],
  }

  const coverageChartData = {
    labels: ['Engineering', 'Sales', 'HR', 'Finance', 'Operations'],
    datasets: [{
      label: 'Coverage %',
      data: [95, 88, 92, 85, 90],
      backgroundColor: 'rgba(20, 184, 166, 0.6)',
      borderColor: 'rgba(20, 184, 166, 1)',
      borderWidth: 2,
    }],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
    },
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
              Scheduling & Shifts — Manager Console
            </h2>
            <p className="mt-1 text-sm md:text-base text-gray-600 dark:text-gray-300">
              Plan, optimize, and publish rosters. Drag-and-drop ready design.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-glow transition flex items-center justify-center gap-2">
              <iconify-icon icon="ph:robot-duotone"></iconify-icon>
              AI Assistant
            </button>
            <button className="px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-900/50 border border-white/40 dark:border-white/10 hover:shadow-glow transition flex items-center justify-center gap-2">
              <iconify-icon icon="ph:bell-duotone" className="text-accent"></iconify-icon>
              Alerts
            </button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-2xl p-5 shadow hover:shadow-glow transition">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs text-slate-500">Shifts This Week</div>
              <div className="text-2xl font-extrabold mt-1">{scheduleData?.shiftsThisWeek || 342}</div>
              <div className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                <iconify-icon icon="ph:arrow-up-right-duotone" className="mr-1"></iconify-icon>
                8% increase
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-600/90 text-white flex items-center justify-center">📅</div>
          </div>
        </div>
        <div className="glass rounded-2xl p-5 shadow hover:shadow-glow transition">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs text-slate-500">Shift Conflicts</div>
              <div className="text-2xl font-extrabold mt-1">{scheduleData?.conflicts || 3}</div>
              <div className="text-xs text-rose-600 mt-2 flex items-center gap-1">
                <iconify-icon icon="ph:warning-duotone" className="mr-1"></iconify-icon>
                Needs attention
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-600/90 text-white flex items-center justify-center">❗</div>
          </div>
        </div>
        <div className="glass rounded-2xl p-5 shadow hover:shadow-glow transition">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs text-slate-500">Swap Requests</div>
              <div className="text-2xl font-extrabold mt-1">{scheduleData?.swapRequests || 12}</div>
              <div className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                <iconify-icon icon="ph:clock-duotone" className="mr-1"></iconify-icon>
                Pending review
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/90 text-white flex items-center justify-center">⇄</div>
          </div>
        </div>
        <div className="glass rounded-2xl p-5 shadow hover:shadow-glow transition">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs text-slate-500">AI Suggestions</div>
              <div className="text-2xl font-extrabold mt-1">{scheduleData?.aiSuggestions || 7}</div>
              <div className="text-xs text-purple-600 mt-2 flex items-center gap-1">
                <iconify-icon icon="ph:lightbulb-duotone" className="mr-1"></iconify-icon>
                Optimizations ready
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-600/90 text-white flex items-center justify-center">🤖</div>
          </div>
        </div>
      </section>

      {/* Tabs + Action Bar */}
      <section className="glass rounded-2xl shadow overflow-hidden">
        <div className="border-b border-white/40 dark:border-white/10">
          <nav className="flex overflow-x-auto -mb-px">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`py-4 px-6 border-b-2 font-medium flex items-center whitespace-nowrap ${
                activeTab === 'calendar'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <iconify-icon icon="ph:calendar-duotone" className="mr-2"></iconify-icon>
              Calendar View
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`py-4 px-6 border-b-2 font-medium flex items-center whitespace-nowrap ${
                activeTab === 'templates'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <iconify-icon icon="ph:stack-duotone" className="mr-2"></iconify-icon>
              Shift Templates
            </button>
            <button
              onClick={() => setActiveTab('rotations')}
              className={`py-4 px-6 border-b-2 font-medium flex items-center whitespace-nowrap ${
                activeTab === 'rotations'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <iconify-icon icon="ph:arrows-clockwise-duotone" className="mr-2"></iconify-icon>
              Rotational Schedules
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-6 border-b-2 font-medium flex items-center whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <iconify-icon icon="ph:chart-pie-duotone" className="mr-2"></iconify-icon>
              Shift Analytics
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-6 border-b-2 font-medium flex items-center whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <iconify-icon icon="ph:gear-six-duotone" className="mr-2"></iconify-icon>
              Settings
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Calendar Tab */}
          {activeTab === 'calendar' && (
            <div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                <div>
                  <h3 className="text-xl font-bold">Weekly Schedule: {selectedWeek}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Drag and drop to assign shifts, click to edit details
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-glow transition flex items-center gap-2">
                    <iconify-icon icon="ph:plus-duotone"></iconify-icon>
                    Create Shift
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-white/80 dark:bg-slate-900/50 border border-white/40 dark:border-white/10 hover:shadow-glow transition flex items-center gap-2">
                    <iconify-icon icon="ph:arrow-square-out-duotone"></iconify-icon>
                    Export
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-white/80 dark:bg-slate-900/50 border border-white/40 dark:border-white/10 hover:shadow-glow transition flex items-center gap-2">
                    <iconify-icon icon="ph:upload-duotone"></iconify-icon>
                    Bulk Import
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-white/80 dark:bg-slate-900/50 border border-white/40 dark:border-white/10 hover:shadow-glow transition flex items-center gap-2">
                    <iconify-icon icon="ph:robot-duotone"></iconify-icon>
                    AI Optimize
                  </button>
                </div>
              </div>

              {/* Calendar View */}
              <div className="glass rounded-xl border border-white/40 dark:border-white/10 overflow-hidden">
                <div className="grid grid-cols-8 gap-0 border-b border-white/40 dark:border-white/10">
                  <div className="p-4 bg-white/50 dark:bg-slate-800/50 font-medium text-center">
                    <span className="inline-flex items-center gap-2">
                      <iconify-icon icon="ph:users-three-duotone"></iconify-icon>
                      Employees
                    </span>
                  </div>
                  <div className="p-4 bg-white/50 dark:bg-slate-800/50 font-medium text-center">Mon<br /><span className="text-xs font-normal">27</span></div>
                  <div className="p-4 bg-white/50 dark:bg-slate-800/50 font-medium text-center">Tue<br /><span className="text-xs font-normal">28</span></div>
                  <div className="p-4 bg-white/50 dark:bg-slate-800/50 font-medium text-center">Wed<br /><span className="text-xs font-normal">29</span></div>
                  <div className="p-4 bg-white/50 dark:bg-slate-800/50 font-medium text-center">Thu<br /><span className="text-xs font-normal">30</span></div>
                  <div className="p-4 bg-white/50 dark:bg-slate-800/50 font-medium text-center">Fri<br /><span className="text-xs font-normal">1</span></div>
                  <div className="p-4 bg-white/50 dark:bg-slate-800/50 font-medium text-center">Sat<br /><span className="text-xs font-normal">2</span></div>
                  <div className="p-4 bg-white/50 dark:bg-slate-800/50 font-medium text-center">Sun<br /><span className="text-xs font-normal">3</span></div>
                </div>

                <div className="divide-y divide-white/40 dark:divide-white/10">
                  {scheduleData?.employees?.map((emp: any) => (
                    <div key={emp.id} className="grid grid-cols-8 gap-0 hover:bg-white/40 dark:hover:bg-white/5 transition-colors duration-200">
                      <div className="p-4 flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                          {emp.name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium">{emp.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{emp.department}</div>
                        </div>
                      </div>
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                        const schedule = scheduleData?.schedules?.find((s: any) => s.employeeId === emp.id && s.day === day)
                        return (
                          <div key={day} className="p-2 flex items-center justify-center">
                            {schedule ? (
                              <div className={`sched-cell rounded-lg p-3 w-full text-center cursor-pointer transition-all duration-300 ${
                                schedule.shift === 'Morning' ? 'bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 border border-blue-300 dark:border-blue-700' :
                                schedule.shift === 'Evening' ? 'bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 border border-purple-300 dark:border-purple-700' :
                                schedule.shift === 'Day Off' ? 'bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 border border-green-300 dark:border-green-700' :
                                'bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600'
                              }`}>
                                <div className={`text-xs font-medium ${
                                  schedule.shift === 'Morning' ? 'text-blue-800 dark:text-blue-200' :
                                  schedule.shift === 'Evening' ? 'text-purple-800 dark:text-purple-200' :
                                  schedule.shift === 'Day Off' ? 'text-green-800 dark:text-green-200' :
                                  'text-gray-600 dark:text-gray-300'
                                }`}>
                                  {schedule.shift}
                                </div>
                                <div className={`text-xs ${
                                  schedule.shift === 'Morning' ? 'text-blue-600 dark:text-blue-300' :
                                  schedule.shift === 'Evening' ? 'text-purple-600 dark:text-purple-300' :
                                  schedule.shift === 'Day Off' ? 'text-green-600 dark:text-green-300' :
                                  'text-gray-500 dark:text-gray-400'
                                }`}>
                                  {schedule.time}
                                </div>
                              </div>
                            ) : (
                              <div className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 w-full text-center">
                                <div className="text-xs font-medium text-gray-600 dark:text-gray-300">Off</div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-6">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 border border-blue-300 dark:border-blue-700 rounded mr-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Morning Shift</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 border border-purple-300 dark:border-purple-700 rounded mr-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Evening Shift</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900 dark:to-red-800 border border-red-300 dark:border-red-700 rounded mr-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Night Shift</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 border border-green-300 dark:border-green-700 rounded mr-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Day Off</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900 dark:to-yellow-800 border border-yellow-300 dark:border-yellow-700 rounded mr-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Training</span>
                </div>
              </div>
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 glass rounded-xl p-4 border border-white/40 dark:border-white/10">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <iconify-icon icon="ph:stack-duotone" className="text-accent"></iconify-icon>
                    Shift Template Designer
                  </h3>
                  <form className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500">Name</label>
                      <input type="text" required className="mt-1 w-full px-3 py-2 rounded-lg border border-white/40 dark:border-white/10 glass" placeholder="e.g., Morning" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500">Start</label>
                        <input type="time" required className="mt-1 w-full px-3 py-2 rounded-lg border border-white/40 dark:border-white/10 glass" defaultValue="08:00" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">End</label>
                        <input type="time" required className="mt-1 w-full px-3 py-2 rounded-lg border border-white/40 dark:border-white/10 glass" defaultValue="17:00" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Break (mins)</label>
                      <input type="number" min="0" step="5" className="mt-1 w-full px-3 py-2 rounded-lg border border-white/40 dark:border-white/10 glass" defaultValue="60" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Tag color</label>
                      <input type="color" className="mt-1 w-16 h-10 p-1 rounded-lg border border-white/40 dark:border-white/10" defaultValue="#3b82f6" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Departments (comma separated)</label>
                      <input type="text" className="mt-1 w-full px-3 py-2 rounded-lg border border-white/40 dark:border-white/10 glass" placeholder="Engineering, HR" />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button type="reset" className="px-3 py-2 rounded-lg glass">Clear</button>
                      <button type="submit" className="px-3 py-2 rounded-lg text-white gradient-accent">Save Template</button>
                    </div>
                  </form>
                  <div className="neon-divider my-4"></div>
                  <div className="flex gap-2 flex-wrap">
                    <button className="px-3 py-2 rounded-lg glass flex items-center gap-2">
                      <iconify-icon icon="ph:arrow-square-out-duotone"></iconify-icon>
                      Export JSON
                    </button>
                    <button className="px-3 py-2 rounded-lg glass flex items-center gap-2">
                      <iconify-icon icon="ph:arrow-square-in-duotone"></iconify-icon>
                      Import JSON
                    </button>
                  </div>
                </div>
                <div className="lg:col-span-2 glass rounded-xl p-4 border border-white/40 dark:border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Saved Templates</h3>
                    <button className="px-3 py-2 rounded-lg glass text-sm">Clear All</button>
                  </div>
                  <div className="grid gap-3">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">Morning Shift</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">08:00 - 17:00 (60 min break)</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="px-3 py-1 rounded-lg glass text-sm">Edit</button>
                          <button className="px-3 py-1 rounded-lg glass text-sm">Delete</button>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-700">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">Evening Shift</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">14:00 - 22:00 (60 min break)</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="px-3 py-1 rounded-lg glass text-sm">Edit</button>
                          <button className="px-3 py-1 rounded-lg glass text-sm">Delete</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rotations Tab */}
          {activeTab === 'rotations' && (
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="glass rounded-xl p-4 border border-white/40 dark:border-white/10">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <iconify-icon icon="ph:arrows-clockwise-duotone" className="text-accent"></iconify-icon>
                    Rotational Builder
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500">Department</label>
                      <select className="mt-1 w-full px-3 py-2 rounded-lg border border-white/40 dark:border-white/10 glass">
                        <option>Engineering</option>
                        <option>HR</option>
                        <option>Sales</option>
                        <option>Operations</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Start date</label>
                      <input type="date" className="mt-1 w-full px-3 py-2 rounded-lg border border-white/40 dark:border-white/10 glass" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Add template to pattern</label>
                      <div className="flex gap-2">
                        <select className="flex-1 px-3 py-2 rounded-lg border border-white/40 dark:border-white/10 glass">
                          <option>Morning Shift</option>
                          <option>Evening Shift</option>
                        </select>
                        <button className="px-3 py-2 rounded-lg glass">Add</button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Pattern</label>
                      <div className="flex flex-wrap gap-2 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm">Morning</span>
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm">Morning</span>
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-sm">Day Off</span>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button className="px-3 py-2 rounded-lg glass">Clear</button>
                      <button className="px-3 py-2 rounded-lg text-white gradient-accent">Preview 14 days</button>
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-2 glass rounded-xl p-4 border border-white/40 dark:border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Rotation Preview</h3>
                    <button className="px-3 py-2 rounded-lg glass text-sm">Export CSV</button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                      <div key={day} className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-white/30 dark:border-gray-700/60">
                        <div className="font-medium text-sm">Day {day}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Morning Shift (8:00-17:00)</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass rounded-xl p-4 border border-white/40 dark:border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Shift Distribution</h3>
                    <button className="px-3 py-2 rounded-lg glass text-sm">Recompute from Preview</button>
                  </div>
                  <div className="h-64">
                    <Pie data={distributionChartData} options={chartOptions} />
                  </div>
                </div>
                <div className="glass rounded-xl p-4 border border-white/40 dark:border-white/10">
                  <h3 className="font-semibold mb-2">Coverage by Department</h3>
                  <div className="h-64">
                    <Bar data={coverageChartData} options={chartOptions} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="glass rounded-xl p-4 border border-white/40 dark:border-white/10">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <iconify-icon icon="ph:calendar-duotone" className="text-accent"></iconify-icon>
                    Holidays
                  </h3>
                  <div className="flex gap-2 mb-3">
                    <input type="text" placeholder="Holiday name" className="flex-1 px-3 py-2 rounded-lg border border-white/40 dark:border-white/10 glass" />
                    <input type="date" className="px-3 py-2 rounded-lg border border-white/40 dark:border-white/10 glass" />
                    <button className="px-3 py-2 rounded-lg glass">Add</button>
                  </div>
                  <div className="grid gap-2">
                    <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg flex justify-between items-center">
                      <span className="text-sm">New Year's Day</span>
                      <span className="text-xs text-gray-500">Jan 1</span>
                    </div>
                  </div>
                </div>
                <div className="glass rounded-xl p-4 border border-white/40 dark:border-white/10">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <iconify-icon icon="ph:bell-duotone" className="text-accent"></iconify-icon>
                    Notifications
                  </h3>
                  <label className="flex items-center gap-2 text-sm mb-2">
                    <input type="checkbox" className="w-4 h-4" defaultChecked />
                    Swap requests
                  </label>
                  <label className="flex items-center gap-2 text-sm mb-2">
                    <input type="checkbox" className="w-4 h-4" defaultChecked />
                    Publish reminders
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="w-4 h-4" defaultChecked />
                    Conflict alerts
                  </label>
                </div>
                <div className="glass rounded-xl p-4 border border-white/40 dark:border-white/10">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <iconify-icon icon="ph:printer-duotone" className="text-accent"></iconify-icon>
                    Utilities
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <button className="px-3 py-2 rounded-lg glass">Print Planner</button>
                    <button className="px-3 py-2 rounded-lg glass">Export Preview (JSON)</button>
                    <button className="px-3 py-2 rounded-lg glass">Import Preview (JSON)</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
