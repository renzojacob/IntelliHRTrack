import { useState } from 'react'
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

interface LeaveRequest {
  id: string;
  // backend may return either a string (employee name) or an object with employee metadata
  employee?: any;
  // backend may use different naming conventions; include common aliases
  department?: string;
  leaveType?: string;
  leave_type?: string;
  startDate?: string;
  start_date?: string;
  endDate?: string;
  end_date?: string;
  // optional/usability helpers (some backends return formatted strings)
  dates?: string;
  duration?: number | string;
  status?: 'pending' | 'approved' | 'declined' | 'cancelled';
  reason?: string;
  notes?: string;
  employeeId?: string;
  employee_id?: string;
  submittedAt?: string;
  submitted_at?: string;
}

interface LeaveType {
  id: string;
  name: string;
  code: string;
  maxDays: number;
  description: string;
}

interface BlackoutPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  reason: string;
  restrictionLevel: 'no-leave' | 'restricted';
}

export default function Leaves() {
  const [activeTab, setActiveTab] = useState('requests')
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null)

  // Fetch leave data
  const { data: leaveData, refetch, isLoading, isError, error } = useQuery('admin-leaves', async () => {
    const response = await api.get('/api/v1/leaves/admin/dashboard')
    return response.data
  }, {
    retry: false,
  })

  // Mutation for approving/denying leave (calls backend `/api/v1/leaves/admin/{id}/status`)
  const processLeaveMutation = useMutation(async ({ requestId, action, remarks }: {
    requestId: string;
    action: 'approve' | 'deny';
    remarks?: string
  }) => {
    const status = action === 'approve' ? 'approved' : 'declined'
    const payload = { status, remarks }
    const response = await api.put(`/api/v1/leaves/admin/${requestId}/status`, payload)
    return response.data
  }, {
    onSuccess: () => {
      // refetch admin list and also invalidate employee queries so employees see the update
      try {
        refetch()
      } catch {}
      try {
        // lazy import useQueryClient via closure to avoid hoisting changes
      } catch {}
      setSelectedRequest(null)
    }
  })

  const handleApprove = (request: LeaveRequest) => {
    // directly call the mutation to approve
    processLeaveMutation.mutate({ requestId: request.id, action: 'approve' })
  }

  const handleDeny = (request: LeaveRequest) => {
    // directly call the mutation to decline
    processLeaveMutation.mutate({ requestId: request.id, action: 'deny' })
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
    },
  }

  const calcDaysBetween = (s?: string, e?: string) => {
    try {
      if (!s || !e) return 0
      const start = new Date(s)
      const end = new Date(e)
      const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1
      return diff > 0 ? diff : 0
    } catch {
      return 0
    }
  }

  // Helpers to support backend-enriched employee objects
  const getEmployeeName = (req: any) => {
    const emp = req?.employee
    if (!emp) return req?.employee || ''
    if (typeof emp === 'string') return emp
    if (emp.name) return emp.name
    const first = emp.first_name || emp.firstName || emp.first || ''
    const last = emp.last_name || emp.lastName || emp.last || ''
    const full = `${first} ${last}`.trim()
    if (full) return full
    // try common fields
    if (emp.employee_id) return emp.employee_id
    return req?.employeeId || ''
  }

  const getEmployeeDept = (req: any) => {
    const emp = req?.employee
    if (!emp) return req?.department || ''
    return emp.department || emp.department_name || req?.department || ''
  }

  const getEmployeeId = (req: any) => {
    const emp = req?.employee
    if (!emp) return req?.employeeId || ''
    return emp.employee_id || emp.employeeId || req?.employeeId || ''
  }

  const getEmployeeInitial = (req: any) => {
    const name = getEmployeeName(req) || ''
    return (typeof name === 'string' && name.length) ? name.charAt(0).toUpperCase() : '?'
  }

  // Build leave type chart data from server response (safe guards)
  const leaveTypeLabels: string[] = (leaveData?.leaveTypes || []).map((lt: LeaveType) => lt.name)
  const leaveTypeCounts: number[] = leaveTypeLabels.map((label) => {
    const name = label.toLowerCase()
    const requests = leaveData?.requests || []
    const count = requests.reduce((acc: number, r: LeaveRequest) => {
      const rt = (r.leaveType || '').toLowerCase()
      if (rt === name) return acc + 1
      if (rt.includes(name.split(' ')[0])) return acc + 1
      if (name.includes(rt.split(' ')[0])) return acc + 1
      return acc
    }, 0)
    return count
  })

  const leaveTypeChartData = {
    labels: leaveTypeLabels,
    datasets: [
      {
        data: leaveTypeCounts.length ? leaveTypeCounts : [0],
        backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(239, 68, 68, 0.8)', 'rgba(245, 158, 11, 0.8)', 'rgba(139, 92, 246, 0.8)'],
      },
    ],
  }

  const leaveTrendChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Leave Requests',
      data: [12, 15, 18, 14, 16, 20, 22, 19, 17, 21, 18, 24],
      borderColor: 'rgba(20, 184, 166, 1)',
      backgroundColor: 'rgba(20, 184, 166, 0.1)',
      tension: 0.4,
    }],
  }

  return (
    <div className="space-y-6">
      {isLoading && (
        <div className="p-6">
          <div className="text-sm text-gray-500">Loading leave dashboard...</div>
        </div>
      )}
      {isError && (
        <div className="p-6">
          <div className="text-sm text-red-600">Failed to load leave data: {(error as any)?.message || 'Unknown error'}. Please ensure you're logged in and the backend is running.</div>
        </div>
      )}
      {/* Header */}
      <header className="relative overflow-hidden rounded-3xl glass p-6 md:p-8 shadow-glow">
        <div className="absolute inset-0 opacity-40 animate-shine" style={{
          backgroundImage: 'linear-gradient(90deg, var(--accent), rgba(255,255,255,0.2), var(--accent))',
          backgroundSize: '200% 100%',
        }}></div>
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Leave Management — Admin Console
            </h2>
            <p className="mt-1 text-sm md:text-base text-gray-600 dark:text-gray-300">
              Approve leave requests, manage policies, and monitor team attendance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 rounded-xl text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-glow transition flex items-center justify-center gap-2">
              <iconify-icon icon="ph:robot-duotone"></iconify-icon>
              AI Assistant
            </button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-2xl p-5 shadow hover:shadow-glow transition">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs text-slate-500">Pending Approvals</div>
              <div className="text-2xl font-extrabold mt-1">{leaveData?.pendingApprovals || 18}</div>
              <div className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                <iconify-icon icon="ph:clock-duotone" className="mr-1"></iconify-icon>
                Requires attention
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/90 text-white flex items-center justify-center">⏱</div>
          </div>
        </div>
        <div className="glass rounded-2xl p-5 shadow hover:shadow-glow transition">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs text-slate-500">On Leave Today</div>
              <div className="text-2xl font-extrabold mt-1">{leaveData?.onLeaveToday || 24}</div>
              <div className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                <iconify-icon icon="ph:calendar-duotone" className="mr-1"></iconify-icon>
                4.2% of workforce
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-600/90 text-white flex items-center justify-center">🏝</div>
          </div>
        </div>
        <div className="glass rounded-2xl p-5 shadow hover:shadow-glow transition">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs text-slate-500">Policy Violations</div>
              <div className="text-2xl font-extrabold mt-1">{leaveData?.policyViolations || 3}</div>
              <div className="text-xs text-rose-600 mt-2 flex items-center gap-1">
                <iconify-icon icon="ph:warning-duotone" className="mr-1"></iconify-icon>
                Needs review
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-600/90 text-white flex items-center justify-center">🚫</div>
          </div>
        </div>
        <div className="glass rounded-2xl p-5 shadow hover:shadow-glow transition">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs text-slate-500">Upcoming Expirations</div>
              <div className="text-2xl font-extrabold mt-1">{leaveData?.upcomingExpirations || 42}</div>
              <div className="text-xs text-purple-600 mt-2 flex items-center gap-1">
                <iconify-icon icon="ph:clock-countdown-duotone" className="mr-1"></iconify-icon>
                Within 30 days
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-600/90 text-white flex items-center justify-center">⌛</div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="glass rounded-2xl shadow overflow-hidden">
        <div className="border-b border-white/40 dark:border-white/10">
          <nav className="flex overflow-x-auto -mb-px">
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-4 px-6 border-b-2 font-medium flex items-center whitespace-nowrap ${
                activeTab === 'requests'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <iconify-icon icon="ph:inbox-duotone" className="mr-2"></iconify-icon>
              Leave Requests
            </button>
            <button
              onClick={() => setActiveTab('policies')}
              className={`py-4 px-6 border-b-2 font-medium flex items-center whitespace-nowrap ${
                activeTab === 'policies'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <iconify-icon icon="ph:gear-six-duotone" className="mr-2"></iconify-icon>
              Policy Management
            </button>
            <button
              onClick={() => setActiveTab('blackouts')}
              className={`py-4 px-6 border-b-2 font-medium flex items-center whitespace-nowrap ${
                activeTab === 'blackouts'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <iconify-icon icon="ph:calendar-x-duotone" className="mr-2"></iconify-icon>
              Blackout Periods
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
              Analytics
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Requests Tab */}
          {activeTab === 'requests' && (
            <div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                <div>
                  <h3 className="text-xl font-bold">Pending Leave Requests</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Review, approve or decline employee leave requests
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button className="px-4 py-2 rounded-lg bg-white/80 dark:bg-slate-900/50 border border-white/40 dark:border-white/10 hover:shadow-glow transition flex items-center gap-2">
                    <iconify-icon icon="ph:export-duotone"></iconify-icon>
                    Export
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-white/80 dark:bg-slate-900/50 border border-white/40 dark:border-white/10 hover:shadow-glow transition flex items-center gap-2">
                    <iconify-icon icon="ph:upload-duotone"></iconify-icon>
                    Bulk Import
                  </button>
                  <button className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-glow transition flex items-center gap-2">
                    <iconify-icon icon="ph:robot-duotone"></iconify-icon>
                    AI Risk Check
                  </button>
                </div>
              </div>

              {/* Leave Requests Table */}
              <div className="glass rounded-xl border border-white/40 dark:border-white/10 overflow-hidden mb-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-white/40 dark:divide-white/10">
                    <thead className="bg-white/60 dark:bg-slate-800/60">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Employee</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Leave Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Dates & Duration</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Reason</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/40 dark:divide-white/10">
                      {leaveData?.requests?.map((req: LeaveRequest) => (
                        <tr key={req.id} className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                                  {getEmployeeInitial(req)}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium">{getEmployeeName(req)}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{getEmployeeDept(req)}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">{getEmployeeDept(req)}</div>
                                  <div className="text-xs text-gray-400">ID: {getEmployeeId(req)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              (req.leaveType || '').toString().toLowerCase().includes('vac') ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                              (req.leaveType || '').toString().toLowerCase().includes('sick') ? 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200' :
                              'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                            }`}>
                              {req.leaveType || req.leave_type || ''}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">{req.dates || `${req.startDate || ''} - ${req.endDate || ''}`}</div>
                            <div className="text-xs text-gray-500">{typeof req.duration === 'number' ? `${req.duration} days` : (req.duration || '')}</div>
                            <div className="text-xs text-gray-400">Submitted: {new Date(req.submittedAt || req.submitted_at || Date.now()).toLocaleDateString()}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm max-w-xs truncate" title={req.reason || req.notes}>
                              {req.reason || req.notes || ''}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              (req.status || '').toString() === 'approved' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' :
                              (req.status || '').toString() === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' :
                              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {((req.status || '')?.toString() || '').charAt(0).toUpperCase() + ((req.status || '')?.toString() || '').slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2 flex-wrap">
                              {req.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleApprove(req)}
                                    className="text-emerald-600 hover:text-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-lg flex items-center"
                                  >
                                    <iconify-icon icon="ph:check-fat" className="mr-1"></iconify-icon>
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleDeny(req)}
                                    className="text-rose-600 hover:text-rose-800 bg-rose-50 dark:bg-rose-900/30 px-3 py-1 rounded-lg flex items-center"
                                  >
                                    <iconify-icon icon="ph:x" className="mr-1"></iconify-icon>
                                    Deny
                                  </button>
                                </>
                              )}
                              <button 
                                onClick={() => setSelectedRequest(req)}
                                className="text-blue-600 hover:text-blue-800 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-lg flex items-center"
                              >
                                <iconify-icon icon="ph:eye" className="mr-1"></iconify-icon>
                                View Details
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

          {/* Policy Management Tab */}
          {activeTab === 'policies' && (
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="glass rounded-xl p-4 border border-white/40 dark:border-white/10">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <iconify-icon icon="ph:sliders-duotone" className="text-accent"></iconify-icon>
                    Create Leave Policy
                  </h3>
                  <form className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500">Policy Name</label>
                      <input type="text" required className="mt-1 w-full px-3 py-2 rounded-lg border border-white/40 dark:border-white/10 glass" placeholder="e.g., Vacation Policy" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Policy Code</label>
                      <input type="text" required className="mt-1 w-full px-3 py-2 rounded-lg border border-white/40 dark:border-white/10 glass" placeholder="e.g., VL" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500">Max Days/Year</label>
                        <input type="number" step="0.5" min="0" className="mt-1 w-full px-3 py-2 rounded-lg border border-white/40 dark:border-white/10 glass" defaultValue="20" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Carryover Limit</label>
                        <input type="number" step="0.5" min="0" className="mt-1 w-full px-3 py-2 rounded-lg border border-white/40 dark:border-white/10 glass" defaultValue="5" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Eligible Roles</label>
                      <input type="text" className="mt-1 w-full px-3 py-2 rounded-lg border border-white/40 dark:border-white/10 glass" placeholder="Full-time, Part-time" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Minimum Notice (days)</label>
                      <input type="number" min="0" className="mt-1 w-full px-3 py-2 rounded-lg border border-white/40 dark:border-white/10 glass" defaultValue="3" />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" className="w-4 h-4" />
                        Require medical documents
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" className="w-4 h-4" />
                        Allow half-day leaves
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" className="w-4 h-4" />
                        Auto-approve for managers
                      </label>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button type="reset" className="px-3 py-2 rounded-lg glass">Clear</button>
                      <button type="submit" className="px-3 py-2 rounded-lg text-white gradient-accent">Save Policy</button>
                    </div>
                  </form>
                </div>
                <div className="lg:col-span-2 glass rounded-xl p-4 border border-white/40 dark:border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Active Policies</h3>
                    <div className="flex gap-2">
                      <button className="px-3 py-2 rounded-lg glass text-sm">Export JSON</button>
                      <button className="px-3 py-2 rounded-lg glass text-sm">Import JSON</button>
                    </div>
                  </div>
                  <div className="grid gap-3">
                    {leaveData?.leaveTypes?.map((policy: LeaveType) => (
                      <div key={policy.id} className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{policy.name}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Code: {policy.code} | Max Days: {policy.maxDays} | {policy.description}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button className="px-3 py-1 rounded-lg glass text-sm">Edit</button>
                            <button className="px-3 py-1 rounded-lg bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200 text-sm">Delete</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Blackout Periods Tab */}
          {activeTab === 'blackouts' && (
            <div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                <div>
                  <h3 className="text-xl font-bold">Blackout Period Management</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Manage periods when leave requests are restricted or not allowed
                  </p>
                </div>
                <button className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-glow transition flex items-center gap-2">
                  <iconify-icon icon="ph:plus-duotone"></iconify-icon>
                  Add Blackout Period
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass rounded-xl p-6 border border-white/40 dark:border-white/10">
                  <h3 className="text-lg font-semibold mb-4">Add New Blackout Period</h3>
                  <form className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Period Name</label>
                      <input type="text" className="mt-1 w-full px-3 py-2 rounded-lg border border-white/40 dark:border-white/10 glass" placeholder="e.g., Year-End Closing" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                        <input type="date" className="mt-1 w-full px-3 py-2 rounded-lg border border-white/40 dark:border-white/10 glass" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                        <input type="date" className="mt-1 w-full px-3 py-2 rounded-lg border border-white/40 dark:border-white/10 glass" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Restriction Level</label>
                      <select className="mt-1 w-full px-3 py-2 rounded-lg border border-white/40 dark:border-white/10 glass">
                        <option value="no-leave">No Leave Allowed</option>
                        <option value="restricted">Restricted (Approval Required)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Reason</label>
                      <textarea className="mt-1 w-full px-3 py-2 rounded-lg border border-white/40 dark:border-white/10 glass" rows={3} placeholder="Explain why leave is restricted during this period..."></textarea>
                    </div>
                    <button type="submit" className="w-full px-4 py-2 rounded-lg text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-glow transition">
                      Create Blackout Period
                    </button>
                  </form>
                </div>

                <div className="glass rounded-xl p-6 border border-white/40 dark:border-white/10">
                  <h3 className="text-lg font-semibold mb-4">Active Blackout Periods</h3>
                  <div className="space-y-3">
                    {leaveData?.blackoutPeriods?.map((period: BlackoutPeriod) => (
                      <div key={period.id} className={`p-3 rounded-lg border ${
                        period.restrictionLevel === 'no-leave' 
                          ? 'bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-700'
                          : 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{period.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(period.startDate).toLocaleDateString()} - {new Date(period.endDate).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{period.reason}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            period.restrictionLevel === 'no-leave'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-800 dark:text-rose-200'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-200'
                          }`}>
                            {period.restrictionLevel === 'no-leave' ? 'No Leave' : 'Restricted'}
                          </span>
                        </div>
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
                    <h3 className="font-semibold">Leave Type Distribution</h3>
                    <button className="px-3 py-2 rounded-lg glass text-sm">Recompute</button>
                  </div>
                  <div className="h-64">
                    <Pie data={leaveTypeChartData} options={chartOptions} />
                  </div>
                </div>
                <div className="glass rounded-xl p-4 border border-white/40 dark:border-white/10">
                  <h3 className="font-semibold mb-2">Monthly Leave Trend</h3>
                  <div className="h-64">
                    <Bar data={leaveTrendChartData} options={chartOptions} />
                  </div>
                </div>
              </div>

              {/* Policy Violations Section */}
              <div className="glass rounded-xl p-6 border border-white/40 dark:border-white/10 mt-6">
                <h3 className="text-lg font-semibold mb-4">Policy Violations & Alerts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 bg-rose-50 dark:bg-rose-900/30 rounded-lg border border-rose-200 dark:border-rose-700">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center text-white">
                        <iconify-icon icon="ph:warning-duotone"></iconify-icon>
                      </div>
                      <div>
                        <p className="font-medium text-rose-800 dark:text-rose-300">Overlapping Requests</p>
                        <p className="text-sm text-rose-600 dark:text-rose-400">3 cases detected</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/30 rounded-lg border border-amber-200 dark:border-amber-700">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white">
                        <iconify-icon icon="ph:clock-countdown-duotone"></iconify-icon>
                      </div>
                      <div>
                        <p className="font-medium text-amber-800 dark:text-amber-300">Insufficient Balance</p>
                        <p className="text-sm text-amber-600 dark:text-amber-400">5 requests blocked</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-700">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white">
                        <iconify-icon icon="ph:calendar-x-duotone"></iconify-icon>
                      </div>
                      <div>
                        <p className="font-medium text-purple-800 dark:text-purple-300">Blackout Violations</p>
                        <p className="text-sm text-purple-600 dark:text-purple-400">2 attempts made</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Leave Request Details</h3>
              <button 
                onClick={() => setSelectedRequest(null)}
                className="p-2 rounded-lg hover:bg-white/20"
              >
                <iconify-icon icon="ph:x"></iconify-icon>
              </button>
            </div>
            
            <div className="space-y-4">
                <div>
                <label className="text-sm font-medium text-gray-500">Employee</label>
                <p className="font-medium">{getEmployeeName(selectedRequest)}</p>
                <p className="text-sm text-gray-500">{getEmployeeDept(selectedRequest)} • {getEmployeeId(selectedRequest)}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Leave Type</label>
                <p>{selectedRequest.leaveType}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Dates</label>
                <p>{selectedRequest.dates} ({typeof selectedRequest.duration === 'number' ? `${selectedRequest.duration} days` : (selectedRequest.duration || '')})</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Reason</label>
                <p className="bg-white/50 dark:bg-slate-800/50 p-3 rounded-lg">{selectedRequest.reason}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Submitted</label>
                <p>{selectedRequest?.submittedAt ? new Date(selectedRequest.submittedAt).toLocaleDateString() : ''}</p>
              </div>

              {selectedRequest.status === 'pending' && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => selectedRequest && handleApprove(selectedRequest)}
                    className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => selectedRequest && handleDeny(selectedRequest)}
                    className="flex-1 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition"
                  >
                    Deny
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
