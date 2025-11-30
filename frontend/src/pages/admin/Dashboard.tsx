import { useEffect, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { api } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
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

export default function AdminDashboard() {
  const { user } = useAuthStore()
  const [liveFeed, setLiveFeed] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [anomalies, setAnomalies] = useState<string[]>([])
  const [devices, setDevices] = useState<any[]>([])
  const [aiInsight, setAiInsight] = useState('')
  const [dailyBrief, setDailyBrief] = useState('')
  const [lastAudit, setLastAudit] = useState<Date | null>(null)
  const [heatmapData, setHeatmapData] = useState<Record<string, number[]>>({})
  const [isOnline, setIsOnline] = useState(true)
  const deptChartRef = useRef<ChartJS<'bar'>>(null)
  const predictChartRef = useRef<ChartJS<'line'>>(null)

  const { data: stats, isLoading } = useQuery('dashboard-stats', async () => {
    const response = await api.get('/api/v1/analytics/dashboard')
    return response.data
  })

  // Network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Initialize mock data
  useEffect(() => {
    // Mock live feed data
    const events = [
      { time: '09:15', name: 'John Doe', dept: 'Sales', action: 'Checked In', method: 'Face', status: 'on_time' },
      { time: '09:20', name: 'Jane Smith', dept: 'Ops', action: 'Checked In', method: 'Fingerprint', status: 'late' },
      { time: '09:25', name: 'Bob Johnson', dept: 'IT', action: 'Checked In', method: 'Face', status: 'on_time' },
    ]
    setLiveFeed(events)

    // Mock alerts
    setAlerts([
      { level: 'High', text: '4 employees absent in Logistics — auto-escalated.', time: '1 hour ago' },
      { level: 'Medium', text: 'Fingerprint scanner A showing sync delay (15m).', time: '2 hours ago' },
      { level: 'Low', text: 'Leave expiration: 2 employees (Sales) today.', time: '3 hours ago' },
    ])

    // Mock anomalies
    setAnomalies([
      'Cross-device mismatch: ID#1292 saw two different kiosks in 5m',
      'Repeated tardiness flagged for Employee #433',
    ])

    // Mock devices
    setDevices([
      { name: 'Camera Kiosk #3', status: 'online', last: '2m', battery: 'n/a' },
      { name: 'Fingerprint Scanner A', status: 'sync_delay', last: '15m', battery: '78%' },
      { name: 'Server (Attendance DB)', status: 'healthy', last: '5s', battery: 'n/a' },
    ])

    // AI insights
    setAiInsight("Sales Dept. punctuality improved 8% this week; recommend reducing scheduled overtime by 10% next week.")
    setDailyBrief(`Good morning — ${stats?.present || 126} present, ${stats?.on_leave || 12} on leave, ${stats?.absent || 4} absent. Automated recommendation: Check Logistics staffing at 10:00. Anomalies detected: 2.`)

    // Generate heatmap data
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const buckets = ['00–02', '03–05', '06–08', '09–11', '12–14', '15–17', '18–20', '21–23']
    const heatData: Record<string, number[]> = {}
    days.forEach(day => {
      heatData[day] = buckets.map(() => {
        const base = ['Sat', 'Sun'].includes(day) ? 30 : 40
        return Math.max(0, Math.min(100, Math.round(base + (Math.random() * 40 - 10))))
      })
    })
    setHeatmapData(heatData)

    // Simulate live feed updates
    const interval = setInterval(() => {
      const demoNames = ['Carlos', 'Rhea', 'Miguel', 'Noel', 'Aimee', 'Ben', 'Diana']
      const depts = ['Sales', 'Ops', 'HR', 'IT']
      const methods = ['Face', 'Fingerprint']
      const newEvent = {
        time: new Date().toLocaleTimeString(),
        name: `${demoNames[Math.floor(Math.random() * demoNames.length)]} ${['Lopez', 'Garcia', 'Perez'][Math.floor(Math.random() * 3)]}`,
        dept: depts[Math.floor(Math.random() * depts.length)],
        action: 'Checked In',
        method: methods[Math.floor(Math.random() * methods.length)],
        status: Math.random() > 0.7 ? 'late' : 'on_time'
      }
      setLiveFeed(prev => [newEvent, ...prev].slice(0, 12))
    }, 6000)

    return () => clearInterval(interval)
  }, [stats])

  // Department Activity Chart
  const deptChartData = {
    labels: ['IT', 'Sales', 'HR', 'Finance', 'Operations'],
    datasets: [
      {
        label: 'Active Employees',
        data: [25, 30, 15, 20, 18],
        backgroundColor: 'rgba(20, 184, 166, 0.6)',
        borderColor: 'rgba(20, 184, 166, 1)',
        borderWidth: 2,
      },
    ],
  }

  // Predictive Workforce Chart
  const predictChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Expected',
        data: [120, 125, 130, 128, 125, 80, 50],
        borderColor: 'rgba(20, 184, 166, 1)',
        backgroundColor: 'rgba(20, 184, 166, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Actual',
        data: [118, 123, 128, 126, 124, 0, 0],
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="skeleton w-64 h-8 mb-4"></div>
          <div className="skeleton w-96 h-64"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Hero Header - Updated with original styling */}
      <header id="section-top" className="relative overflow-hidden rounded-3xl glass p-6 md:p-8 shadow-glow">
        <div
          className="absolute inset-0 opacity-40 animate-shine"
          style={{
            backgroundImage: 'linear-gradient(90deg, var(--accent), rgba(255,255,255,0.2), var(--accent))',
            backgroundSize: '200% 100%',
          }}
        ></div>
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Dashboard — Real-Time Workforce Overview
            </h2>
            <p className="mt-1 text-sm md:text-base text-gray-600 dark:text-gray-300">
              Intelligent visualization, predictive analytics, and operational control.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-xl glass hover:shadow-glow transition" aria-label="Open Menu">
              <iconify-icon icon="ph:list-duotone"></iconify-icon>
            </button>
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl glass text-xs">
              <span 
                className={`inline-block w-2.5 h-2.5 rounded-full pulse-subtle ${
                  isOnline ? 'bg-green-500' : 'bg-rose-500'
                }`} 
                title={isOnline ? 'Online' : 'Offline'}
              ></span>
              <Clock />
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Welcome, {user?.username || 'Admin'}</div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center font-semibold">
              {user?.username?.charAt(0).toUpperCase() || 'A'}
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <section className="grid grid-cols-12 gap-6">
        {/* Left column */}
        <div className="col-span-12 xl:col-span-8 space-y-6">
          {/* Counters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass rounded-2xl p-4 shadow transition hover:shadow-glow">
              <div className="text-xs text-gray-500 dark:text-gray-400">Present</div>
              <div className="mt-1 text-3xl font-extrabold">{stats?.present || 126}</div>
              <div className="text-sm text-green-500">+3 since last hour</div>
            </div>
            <div className="glass rounded-2xl p-4 shadow transition hover:shadow-glow">
              <div className="text-xs text-gray-500 dark:text-gray-400">Late</div>
              <div className="mt-1 text-3xl font-extrabold text-amber-600">{stats?.late || 8}</div>
              <div className="text-sm text-amber-500">Highest: Sales</div>
            </div>
            <div className="glass rounded-2xl p-4 shadow transition hover:shadow-glow">
              <div className="text-xs text-gray-500 dark:text-gray-400">On Leave</div>
              <div className="mt-1 text-3xl font-extrabold text-blue-600">{stats?.on_leave || 12}</div>
              <div className="text-sm text-gray-500">Planned / Unplanned: 9/3</div>
            </div>
            <div className="glass rounded-2xl p-4 shadow transition hover:shadow-glow">
              <div className="text-xs text-gray-500 dark:text-gray-400">Absent</div>
              <div className="mt-1 text-3xl font-extrabold text-rose-600">{stats?.absent || 4}</div>
              <div className="text-sm text-rose-500">Auto-alert sent</div>
            </div>
          </div>

          {/* Live Feed + Actions */}
          <div className="glass rounded-3xl p-4 md:p-6 shadow grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <h3 className="font-semibold flex items-center gap-2">
                <iconify-icon icon="ph:radio-duotone" className="text-accent"></iconify-icon>
                Live Attendance Feed
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Streaming last 12 events (face, fingerprint, manual) • Updated: now
              </p>
              <ul className="mt-3 space-y-2 max-h-56 overflow-auto fancy-scroll">
                {liveFeed.map((event, idx) => (
                  <li key={idx} className="p-2 rounded-xl hover:ring-1 hover:ring-white/40 hover:shadow-glow transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">
                          {event.name} <span className="text-xs text-gray-500 dark:text-gray-300">({event.dept})</span>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-300">
                          {event.method} • Kiosk-01
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-300">{event.time}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:border-l lg:pl-6">
              <h3 className="font-semibold flex items-center gap-2">
                <iconify-icon icon="ph:bolt-duotone" className="text-accent"></iconify-icon>
                Quick Actions
              </h3>
              <div className="mt-3 grid gap-2">
                <button className="w-full py-2 rounded-xl text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-glow transition flex items-center justify-center gap-2">
                  <iconify-icon icon="ph:currency-circle-dollar-duotone"></iconify-icon>
                  Generate Payroll
                </button>
                <button className="w-full py-2 rounded-xl glass hover:shadow-glow transition flex items-center justify-center gap-2">
                  <iconify-icon icon="ph:check-circle-duotone"></iconify-icon>
                  Approve Leaves
                </button>
                <button className="w-full py-2 rounded-xl glass hover:shadow-glow transition flex items-center justify-center gap-2">
                  <iconify-icon icon="ph:user-plus-duotone"></iconify-icon>
                  Register Employee
                </button>
                <button className="w-full py-2 rounded-xl bg-white/80 dark:bg-slate-900/50 border border-white/40 dark:border-white/10 hover:shadow-glow transition flex items-center justify-center gap-2">
                  <iconify-icon icon="ph:export-duotone" className="text-accent"></iconify-icon>
                  Export Audit Snapshot
                </button>
                <button className="w-full py-2 rounded-xl bg-rose-500 text-white hover:shadow-glow transition flex items-center justify-center gap-2">
                  <iconify-icon icon="ph:warning-octagon-duotone"></iconify-icon>
                  Run Anomaly Scan
                </button>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass rounded-3xl p-4 md:p-6 shadow">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold flex items-center gap-2">
                  <iconify-icon icon="ph:chart-bar-duotone" className="text-accent"></iconify-icon>
                  Department Activity Summary
                </h4>
              </div>
              <div className="mt-4 h-64">
                <Bar ref={deptChartRef} data={deptChartData} options={chartOptions} />
              </div>
            </div>
            <div className="glass rounded-3xl p-4 md:p-6 shadow">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold flex items-center gap-2">
                  <iconify-icon icon="ph:chart-line-duotone" className="text-accent"></iconify-icon>
                  Predictive Workforce Availability
                </h4>
              </div>
              <div className="mt-4 h-64">
                <Line ref={predictChartRef} data={predictChartData} options={chartOptions} />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Forecast uses historical patterns & schedule data.
              </p>
            </div>
          </div>

          {/* Insights + KPI */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="glass rounded-3xl p-4 md:p-6 shadow lg:col-span-2">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold flex items-center gap-2">
                    <iconify-icon icon="ph:sparkle-duotone" className="text-accent"></iconify-icon>
                    Smart Attendance Insights
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">AI-generated summary of notable trends</p>
                </div>
                <div className="text-xs text-gray-400">Updated: {new Date().toLocaleTimeString()}</div>
              </div>
              <div className="mt-4 text-sm text-gray-700 dark:text-gray-200">
                <p>{aiInsight || "Loading insight..."}</p>
              </div>
            </div>
            <div className="glass rounded-3xl p-4 md:p-6 shadow">
              <h4 className="font-semibold flex items-center gap-2">
                <iconify-icon icon="ph:gauge-duotone" className="text-accent"></iconify-icon>
                KPI Snapshot
              </h4>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  Attendance Reliability Index <span className="font-bold">92%</span>
                </div>
                <div className="flex items-center justify-between">
                  Average Tardiness <span className="font-bold">7m</span>
                </div>
                <div className="flex items-center justify-between">
                  Overtime Ratio <span className="font-bold">4.1%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Heatmap */}
          <div className="glass rounded-3xl p-4 md:p-6 shadow relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold flex items-center gap-2">
                  <iconify-icon icon="ph:fire-duotone" className="text-accent"></iconify-icon>
                  Interactive Heatmap — Office Entry Peaks
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Displays density of employee entry logs by hour and weekday • Last refresh: {new Date().toLocaleTimeString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                    const buckets = ['00–02', '03–05', '06–08', '09–11', '12–14', '15–17', '18–20', '21–23']
                    const heatData: Record<string, number[]> = {}
                    days.forEach(day => {
                      heatData[day] = buckets.map(() => {
                        const base = ['Sat', 'Sun'].includes(day) ? 30 : 40
                        return Math.max(0, Math.min(100, Math.round(base + (Math.random() * 40 - 10))))
                      })
                    })
                    setHeatmapData(heatData)
                  }}
                  className="text-xs px-3 py-1 rounded-md bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-glow transition"
                >
                  Refresh
                </button>
              </div>
            </div>
            <div className="mt-4 overflow-auto fancy-scroll">
              <div className="min-w-[680px]">
                <div className="grid grid-cols-[80px_repeat(8,1fr)] gap-1 items-center mb-1">
                  <div className="font-semibold text-left text-xs text-gray-600 dark:text-gray-300">Day</div>
                  {['00–02', '03–05', '06–08', '09–11', '12–14', '15–17', '18–20', '21–23'].map(bucket => (
                    <div key={bucket} className="text-xs font-medium text-gray-600 dark:text-gray-300 text-center">
                      {bucket}
                    </div>
                  ))}
                </div>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <div key={day} className="grid grid-cols-[80px_repeat(8,1fr)] gap-1 items-center mt-1">
                    <div className="font-medium text-left text-sm text-gray-700 dark:text-gray-200">{day}</div>
                    {heatmapData[day]?.map((val, idx) => {
                      const intensity = Math.min(7, Math.floor(val / 15))
                      const bgClasses = [
                        'bg-blue-50 dark:bg-blue-900/20',
                        'bg-blue-100 dark:bg-blue-900/30',
                        'bg-blue-200 dark:bg-blue-800/40',
                        'bg-blue-300 dark:bg-blue-700/50',
                        'bg-blue-400 dark:bg-blue-600/60',
                        'bg-blue-500 dark:bg-blue-500/70',
                        'bg-blue-600 dark:bg-blue-400/80',
                        'bg-blue-700 dark:bg-blue-300/90',
                      ]
                      return (
                        <div
                          key={idx}
                          className={`h-8 rounded heat-cell ${bgClasses[intensity]} relative flex items-center justify-center cursor-pointer hover:scale-110 transition-transform`}
                          title={`${day} ${['00–02', '03–05', '06–08', '09–11', '12–14', '15–17', '18–20', '21–23'][idx]}: ${val} entries`}
                        >
                          <span className="text-xs font-medium">{val}</span>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="col-span-12 xl:col-span-4 space-y-6">
          {/* Notifications & Alerts */}
          <div className="glass rounded-3xl p-4 md:p-6 shadow">
            <h4 className="font-semibold flex items-center gap-2 mb-4">
              <iconify-icon icon="ph:bell-ringing-duotone" className="text-accent"></iconify-icon>
              Notifications & Alerts
            </h4>
            <div className="space-y-2 max-h-64 overflow-auto fancy-scroll">
              {alerts.map((alert, idx) => (
                <div key={idx} className="p-2 rounded-md border glass text-sm">
                  <div className="font-medium">{alert.text}</div>
                  <div className="text-xs text-gray-400">Severity: {alert.level} • {alert.time}</div>
                </div>
              ))}
            </div>
          </div>

          {/* System Health */}
          <div className="glass rounded-3xl p-4 md:p-6 shadow">
            <h4 className="font-semibold flex items-center gap-2 mb-4">
              <iconify-icon icon="ph:heartbeat-duotone" className="text-accent"></iconify-icon>
              System Health & Device Status
            </h4>
            <div className="space-y-2 text-sm">
              {devices.map((device, idx) => {
                const statusColor = device.status === 'online' || device.status === 'healthy' 
                  ? 'text-green-500' 
                  : device.status === 'sync_delay' 
                  ? 'text-yellow-500' 
                  : 'text-rose-400'
                return (
                  <div key={idx} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{device.name}</div>
                      <div className="text-xs text-gray-400">{device.last} • {device.battery}</div>
                </div>
                    <div className={statusColor}>{device.status}</div>
              </div>
                )
              })}
                </div>
            <div className="mt-3">
              <button
                onClick={() => {
                  setDevices(prev => [...prev, { name: 'New Device', status: 'online', last: 'now', battery: '95%' }])
                }}
                className="w-full py-2 rounded-xl text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:shadow-glow transition flex items-center justify-center gap-2"
              >
                <iconify-icon icon="ph:stethoscope-duotone"></iconify-icon>
                Run Diagnostics
              </button>
            </div>
          </div>

          {/* Anomaly Alerts */}
          <div className="glass rounded-3xl p-4 md:p-6 shadow">
            <h4 className="font-semibold flex items-center gap-2 mb-4">
              <iconify-icon icon="ph:warning-duotone" className="text-accent"></iconify-icon>
              Anomaly Alerts & Risk Signals
            </h4>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
              {anomalies.map((anomaly, idx) => (
                <li key={idx} className="p-2 rounded-md">{anomaly}</li>
              ))}
            </ul>
          </div>

          {/* Audit Snapshot */}
          <div className="glass rounded-3xl p-4 md:p-6 shadow">
            <h4 className="font-semibold flex items-center gap-2 mb-4">
              <iconify-icon icon="ph:shield-check-duotone" className="text-accent"></iconify-icon>
              Audit Snapshot
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Quick export of current system state for audits, compliance, and incident tracking.
            </p>
            <div className="grid gap-2">
              <button
                onClick={() => {
                  const audit = {
                    timestamp: new Date().toISOString(),
                    present: stats?.present || 126,
                    late: stats?.late || 8,
                    on_leave: stats?.on_leave || 12,
                    absent: stats?.absent || 4,
                    devices,
                    alerts,
                    anomalies,
                    note: 'Auto-generated by Think Web demo UI'
                  }
                  setLastAudit(new Date())
                  const blob = new Blob([JSON.stringify(audit, null, 2)], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `audit_${new Date().toISOString().split('T')[0]}.json`
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                className="w-full py-2 rounded-xl bg-emerald-500 text-white hover:shadow-glow transition"
              >
                Capture Snapshot
              </button>
              <button
                onClick={() => {
                  if (!lastAudit) {
                    alert('Please capture a snapshot first')
                    return
                  }
                  const audit = {
                    timestamp: lastAudit.toISOString(),
                    present: stats?.present || 126,
                    late: stats?.late || 8,
                    on_leave: stats?.on_leave || 12,
                    absent: stats?.absent || 4,
                    devices,
                    alerts,
                    anomalies,
                  }
                  const blob = new Blob([JSON.stringify(audit, null, 2)], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `audit_${lastAudit.toISOString().split('T')[0]}.json`
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                className="w-full py-2 rounded-xl bg-white/80 dark:bg-slate-900/50 border border-white/40 dark:border-white/10 hover:shadow-glow transition"
              >
                Download JSON
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-400">
              Last captured: {lastAudit ? lastAudit.toLocaleString() : '—'}
              </div>
              </div>

          {/* AI Daily Briefing */}
          <div className="glass rounded-3xl p-4 md:p-6 shadow">
            <h4 className="font-semibold flex items-center gap-2 mb-4">
              <iconify-icon icon="ph:robot-duotone" className="text-accent"></iconify-icon>
              AI-Generated Daily Briefing
            </h4>
            <div className="mt-2 text-sm text-gray-700 dark:text-gray-200">
              {dailyBrief || 'Preparing today\'s briefing...'}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}