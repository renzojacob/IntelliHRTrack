import { useState, useEffect } from 'react';
import { useQuery } from 'react-query'
import { api } from '../../services/api'

interface LeaveRequest {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  dates: string;
  duration: string;
  status: 'pending' | 'approved' | 'declined' | 'cancelled';
  reason: string;
  approver: string;
  submittedAt: string;
}

interface LeaveBalance {
  type: string;
  total: number;
  used: number;
  remaining: number;
  maxDays: number;
}

interface BlackoutPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  reason: string;
  restrictionLevel: 'no-leave' | 'restricted';
}

export default function EmployeeLeaves() {
  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [duration, setDuration] = useState('full');
  const [reason, setReason] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState('');
  const [isOnline, setIsOnline] = useState(true);

  // Mock data - replace with actual API calls
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([
    {
      id: '1',
      type: 'Vacation Leave',
      startDate: '2023-12-20',
      endDate: '2023-12-23',
      dates: 'Dec 20 - 23, 2023',
      duration: '4 days',
      status: 'pending',
      reason: 'Family vacation',
      approver: 'Sarah Johnson',
      submittedAt: '2023-12-01'
    },
    {
      id: '2',
      type: 'Sick Leave',
      startDate: '2023-11-15',
      endDate: '2023-11-15',
      dates: 'Nov 15, 2023',
      duration: '1 day',
      status: 'approved',
      reason: 'Medical appointment',
      approver: 'Sarah Johnson',
      submittedAt: '2023-11-10'
    }
  ]);

  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([
    { type: 'Vacation Leave', total: 15, used: 9, remaining: 6, maxDays: 15 },
    { type: 'Sick Leave', total: 10, used: 3, remaining: 7, maxDays: 10 },
    { type: 'Emergency Leave', total: 5, used: 1, remaining: 4, maxDays: 5 },
    { type: 'Personal Days', total: 5, used: 2, remaining: 3, maxDays: 5 }
  ]);

  const [blackoutPeriods, setBlackoutPeriods] = useState<BlackoutPeriod[]>([
    {
      id: '1',
      name: 'Year-End Closing',
      startDate: '2023-12-25',
      endDate: '2024-01-02',
      reason: 'Company-wide shutdown',
      restrictionLevel: 'no-leave'
    },
    {
      id: '2',
      name: 'Audit Period',
      startDate: '2024-01-15',
      endDate: '2024-01-30',
      reason: 'Financial audit',
      restrictionLevel: 'restricted'
    }
  ]);

  // Initialize clock
  useEffect(() => {
    const updateClock = () => {
      setCurrentTime(new Date().toLocaleTimeString());
    };
    
    updateClock();
    const interval = setInterval(updateClock, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Helper to compute days between two dates
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

  // Fetch user's leaves from backend; fall back to mock data on error
  const { data: myLeavesData } = useQuery('my-leaves', async () => {
    try {
      const res = await api.get('/api/v1/leaves')
      return res.data
    } catch (err) {
      return null
    }
  }, { retry: false })

  // Normalize server data (if present) into UI shape
  useEffect(() => {
    if (!myLeavesData) return
    // server may return array or an object with 'requests'
    const raw: any[] = Array.isArray(myLeavesData) ? myLeavesData : (myLeavesData.requests || myLeavesData)
    if (!Array.isArray(raw)) return

    const normalized = raw.map((r: any) => {
      const start = r.startDate ?? r.start_date ?? r.from ?? ''
      const end = r.endDate ?? r.end_date ?? r.to ?? ''
      const days = calcDaysBetween(start, end)
      return {
        id: r.id?.toString() ?? String(Date.now()),
        type: r.type ?? r.leaveType ?? r.name ?? 'Leave',
        startDate: start,
        endDate: end,
        dates: r.dates ?? (start && end ? `${new Date(start).toLocaleDateString()} - ${new Date(end).toLocaleDateString()}` : ''),
        duration: r.duration ? (typeof r.duration === 'number' ? `${r.duration} days` : r.duration) : `${days} days`,
        status: r.status ?? 'pending',
        reason: r.reason ?? r.notes ?? '',
        approver: r.approver ?? r.manager ?? 'Pending Assignment',
        submittedAt: r.submittedAt ?? r.submitted_at ?? new Date().toISOString(),
      }
    })

    if (normalized.length) setLeaveRequests(normalized)
  }, [myLeavesData])

  // Network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Validate leave request
  const validateLeaveRequest = () => {
    const errors: string[] = [];

    if (!leaveType) errors.push('Please select a leave type');
    if (!startDate) errors.push('Start date is required');
    if (!endDate) errors.push('End date is required');
    if (!reason.trim()) errors.push('Reason is required');

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end < start) errors.push('End date cannot be before start date');
      
      // Check against blackout periods
      blackoutPeriods.forEach(period => {
        const blackoutStart = new Date(period.startDate);
        const blackoutEnd = new Date(period.endDate);
        if ((start >= blackoutStart && start <= blackoutEnd) || 
            (end >= blackoutStart && end <= blackoutEnd)) {
          errors.push(`Selected dates conflict with blackout period: ${period.name}`);
        }
      });
    }

    // Check leave balance
    const selectedBalance = leaveBalances.find(balance => 
      balance.type.toLowerCase().includes(leaveType.toLowerCase())
    );
    if (selectedBalance) {
      const daysRequested = calculateDaysRequested();
      if (daysRequested > selectedBalance.remaining) {
        errors.push(`Insufficient ${leaveType} balance. Requested: ${daysRequested}, Available: ${selectedBalance.remaining}`);
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const calculateDaysRequested = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  };

  const handleSubmitLeave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateLeaveRequest()) {
      const newRequest: LeaveRequest = {
        id: Date.now().toString(),
        type: leaveType,
        startDate,
        endDate,
        dates: `${new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
        duration: `${calculateDaysRequested()} days`,
        status: 'pending',
        reason,
        approver: 'Pending Assignment',
        submittedAt: new Date().toISOString()
      };

      setLeaveRequests(prev => [newRequest, ...prev]);
      
      // Reset form
      setLeaveType('');
      setStartDate('');
      setEndDate('');
      setDuration('full');
      setReason('');
      setValidationErrors([]);
      
      alert('Leave request submitted successfully!');
    }
  };

  const handleCancelRequest = (id: string, type: string, dates: string) => {
    if (confirm(`Are you sure you want to cancel your ${type} for ${dates}?`)) {
      setLeaveRequests(prev => prev.filter(req => req.id !== id));
    }
  };

  const handleEditRequest = (id: string) => {
    const request = leaveRequests.find(req => req.id === id);
    if (request && request.status === 'pending') {
      setLeaveType(request.type);
      setStartDate(request.startDate);
      setEndDate(request.endDate);
      setReason(request.reason);
      
      // Remove the request being edited
      setLeaveRequests(prev => prev.filter(req => req.id !== id));
      
      // Scroll to form
      document.getElementById('leave-form')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200';
      case 'approved': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'declined': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'cancelled': return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200';
      default: return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200';
    }
  };

  const getLeaveTypeIcon = (type: string) => {
    switch (type) {
      case 'Vacation Leave': return 'ph:beach-duotone';
      case 'Sick Leave': return 'ph:first-aid-duotone';
      case 'Emergency Leave': return 'ph:warning-circle-duotone';
      case 'Official Business': return 'ph:briefcase-duotone';
      case 'Personal Days': return 'ph:user-duotone';
      default: return 'ph:question-duotone';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return 'ph:check-circle-duotone';
      case 'declined': return 'ph:x-circle-duotone';
      case 'pending': return 'ph:clock-duotone';
      case 'cancelled': return 'ph:prohibit-duotone';
      default: return 'ph:question-duotone';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/60 dark:bg-slate-950 text-gray-800 dark:text-gray-100 font-inter">
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed -z-10 inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full blur-3xl opacity-40 bg-gradient-to-r from-teal-400 to-teal-500 animate-float"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-30 bg-gradient-to-br from-blue-500 to-indigo-500 animate-float" style={{animationDelay: '1s'}}></div>
      </div>

      <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <header className="relative overflow-hidden rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg border border-white/35 dark:border-white/10 p-6 md:p-8 shadow-lg">
          <div className="absolute inset-0 opacity-40 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine bg-[length:200%_100%]"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img 
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-4 border-white/50 shadow-lg" 
                  src="https://randomuser.me/api/portraits/men/32.jpg" 
                  alt="Renzo" 
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Leave Management</h1>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mt-1">Manage your time off, track balances, and submit requests</p>
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">ID: EMP-8472</span>
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full">Sales Department</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg border border-white/35 dark:border-white/10 text-xs">
                <span 
                  className={`inline-block w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-rose-500'}`} 
                  title={isOnline ? 'Online' : 'Offline'}
                ></span>
                <span>{currentTime}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Leave Summary Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg border border-white/35 dark:border-white/10 rounded-2xl p-4 shadow transition hover:shadow-lg hover:-translate-y-0.5">
            <div className="text-xs text-gray-500 dark:text-gray-400">Total Leaves This Year</div>
            <div className="mt-1 text-2xl font-extrabold">18</div>
            <div className="text-sm text-blue-500 flex items-center gap-1">
              <iconify-icon icon="ph:trend-up-duotone"></iconify-icon>
              <span>+5 from last year</span>
            </div>
          </div>
          
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg border border-white/35 dark:border-white/10 rounded-2xl p-4 shadow transition hover:shadow-lg hover:-translate-y-0.5">
            <div className="text-xs text-gray-500 dark:text-gray-400">Pending Requests</div>
            <div className="mt-1 text-2xl font-extrabold text-amber-600">
              {leaveRequests.filter(req => req.status === 'pending').length}
            </div>
            <div className="text-sm text-amber-500 flex items-center gap-1">
              <iconify-icon icon="ph:clock-duotone"></iconify-icon>
              <span>Awaiting approval</span>
            </div>
          </div>
          
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg border border-white/35 dark:border-white/10 rounded-2xl p-4 shadow transition hover:shadow-lg hover:-translate-y-0.5">
            <div className="text-xs text-gray-500 dark:text-gray-400">Remaining Vacation</div>
            <div className="mt-1 text-2xl font-extrabold">
              {leaveBalances.find(b => b.type === 'Vacation Leave')?.remaining || 0}
            </div>
            <div className="text-sm text-green-500 flex items-center gap-1">
              <iconify-icon icon="ph:beach-duotone"></iconify-icon>
              <span>days available</span>
            </div>
          </div>
          
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg border border-white/35 dark:border-white/10 rounded-2xl p-4 shadow transition hover:shadow-lg hover:-translate-y-0.5">
            <div className="text-xs text-gray-500 dark:text-gray-400">Approval Rate</div>
            <div className="mt-1 text-2xl font-extrabold text-purple-600">92%</div>
            <div className="text-sm text-purple-500 flex items-center gap-1">
              <iconify-icon icon="ph:check-circle-duotone"></iconify-icon>
              <span>High success rate</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Leave Application */}
          <div className="xl:col-span-2 space-y-6">
            {/* Leave Application Form */}
            <div id="leave-form" className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg border border-white/35 dark:border-white/10 rounded-3xl p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-4">Apply for Leave</h2>
              
              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl">
                  <div className="flex items-center gap-2 text-red-800 dark:text-red-200 mb-2">
                    <iconify-icon icon="ph:warning-circle-duotone"></iconify-icon>
                    <span className="font-medium">Please fix the following issues:</span>
                  </div>
                  <ul className="text-sm text-red-700 dark:text-red-300 list-disc list-inside space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <form onSubmit={handleSubmitLeave} className="space-y-4">
                {/* Leave Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Leave Type *</label>
                  <select 
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 px-4"
                    required
                  >
                    <option value="">Select leave type...</option>
                    <option value="Vacation Leave">Vacation Leave</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Emergency Leave">Emergency Leave</option>
                    <option value="Official Business">Official Business</option>
                    <option value="Personal Days">Personal Days</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date *</label>
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 px-4"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Date *</label>
                    <input 
                      type="date" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 px-4"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Duration *</label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input 
                        type="radio" 
                        name="duration" 
                        value="full"
                        checked={duration === 'full'}
                        onChange={(e) => setDuration(e.target.value)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-2" 
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Full Day</span>
                    </label>
                    <label className="flex items-center">
                      <input 
                        type="radio" 
                        name="duration" 
                        value="half-am"
                        checked={duration === 'half-am'}
                        onChange={(e) => setDuration(e.target.value)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-2" 
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Half Day (AM)</span>
                    </label>
                    <label className="flex items-center">
                      <input 
                        type="radio" 
                        name="duration" 
                        value="half-pm"
                        checked={duration === 'half-pm'}
                        onChange={(e) => setDuration(e.target.value)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-2" 
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Half Day (PM)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reason *</label>
                  <textarea 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 px-4" 
                    rows={3} 
                    placeholder="Please provide details for your leave request..."
                    required
                  ></textarea>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="submit"
                    className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all relative overflow-hidden"
                  >
                    Submit Leave Request
                  </button>
                  <button 
                    type="button"
                    className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-medium transition-all relative overflow-hidden"
                  >
                    Save as Draft
                  </button>
                </div>
              </form>
            </div>

            {/* Leave Request History */}
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg border border-white/35 dark:border-white/10 rounded-3xl p-6 shadow-lg">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold">Leave Request History</h2>
                <div className="flex items-center gap-3">
                  <select className="px-4 py-2 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/35 dark:border-white/10 text-sm">
                    <option>All Status</option>
                    <option>Pending</option>
                    <option>Approved</option>
                    <option>Declined</option>
                    <option>Cancelled</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-4">
                {leaveRequests.map((request) => (
                  <div key={request.id} className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-white/40 dark:border-white/10">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          request.status === 'approved' ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400' :
                          request.status === 'declined' ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400' :
                          request.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400' :
                          'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400'
                        }`}>
                          <iconify-icon icon={getLeaveTypeIcon(request.type)}></iconify-icon>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{request.type}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(request.status)}`}>
                              <iconify-icon icon={getStatusIcon(request.status)} className="mr-1"></iconify-icon>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            {request.dates} • {request.duration}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">
                            {request.reason}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            Submitted: {new Date(request.submittedAt).toLocaleDateString()} • 
                            Approver: {request.approver}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {request.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleEditRequest(request.id)}
                              className="p-2 text-blue-600 hover:text-blue-800 bg-blue-50 dark:bg-blue-900/30 rounded-lg"
                              title="Edit Request"
                            >
                              <iconify-icon icon="ph:pencil-simple-duotone"></iconify-icon>
                            </button>
                            <button 
                              onClick={() => handleCancelRequest(request.id, request.type, request.dates)}
                              className="p-2 text-red-600 hover:text-red-800 bg-red-50 dark:bg-red-900/30 rounded-lg"
                              title="Cancel Request"
                            >
                              <iconify-icon icon="ph:x-duotone"></iconify-icon>
                            </button>
                          </>
                        )}
                        <button className="p-2 text-gray-600 hover:text-gray-800 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                          <iconify-icon icon="ph:eye-duotone"></iconify-icon>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {leaveRequests.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <iconify-icon icon="ph:inbox-duotone" className="text-4xl mb-2"></iconify-icon>
                    <p>No leave requests found</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Balance & Information */}
          <div className="space-y-6">
            {/* Leave Balance Tracker */}
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg border border-white/35 dark:border-white/10 rounded-3xl p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-4">Leave Balance</h2>
              <div className="space-y-4">
                {leaveBalances.map((balance, index) => (
                  <div key={index} className={`p-4 rounded-xl border-l-4 ${
                    balance.type === 'Vacation Leave' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500' :
                    balance.type === 'Sick Leave' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-500' :
                    balance.type === 'Emergency Leave' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' :
                    'bg-purple-50 dark:bg-purple-900/20 border-purple-500'
                  }`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`font-medium ${
                        balance.type === 'Vacation Leave' ? 'text-blue-800 dark:text-blue-300' :
                        balance.type === 'Sick Leave' ? 'text-amber-800 dark:text-amber-300' :
                        balance.type === 'Emergency Leave' ? 'text-red-800 dark:text-red-300' :
                        'text-purple-800 dark:text-purple-300'
                      }`}>
                        {balance.type}
                      </span>
                      <span className={`text-sm ${
                        balance.type === 'Vacation Leave' ? 'text-blue-600 dark:text-blue-400' :
                        balance.type === 'Sick Leave' ? 'text-amber-600 dark:text-amber-400' :
                        balance.type === 'Emergency Leave' ? 'text-red-600 dark:text-red-400' :
                        'text-purple-600 dark:text-purple-400'
                      }`}>
                        {balance.maxDays} days/year
                      </span>
                    </div>
                    <div className={`w-full rounded-full h-2 ${
                      balance.type === 'Vacation Leave' ? 'bg-blue-200 dark:bg-blue-800' :
                      balance.type === 'Sick Leave' ? 'bg-amber-200 dark:bg-amber-800' :
                      balance.type === 'Emergency Leave' ? 'bg-red-200 dark:bg-red-800' :
                      'bg-purple-200 dark:bg-purple-800'
                    }`}>
                      <div 
                        className={`h-2 rounded-full ${
                          balance.type === 'Vacation Leave' ? 'bg-blue-500' :
                          balance.type === 'Sick Leave' ? 'bg-amber-500' :
                          balance.type === 'Emergency Leave' ? 'bg-red-500' :
                          'bg-purple-500'
                        }`}
                        style={{ width: `${(balance.used / balance.maxDays) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className={
                        balance.type === 'Vacation Leave' ? 'text-blue-600 dark:text-blue-400' :
                        balance.type === 'Sick Leave' ? 'text-amber-600 dark:text-amber-400' :
                        balance.type === 'Emergency Leave' ? 'text-red-600 dark:text-red-400' :
                        'text-purple-600 dark:text-purple-400'
                      }>
                        {balance.used} days used
                      </span>
                      <span className={
                        balance.type === 'Vacation Leave' ? 'text-blue-600 dark:text-blue-400' :
                        balance.type === 'Sick Leave' ? 'text-amber-600 dark:text-amber-400' :
                        balance.type === 'Emergency Leave' ? 'text-red-600 dark:text-red-400' :
                        'text-purple-600 dark:text-purple-400'
                      }>
                        {balance.remaining} days remaining
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Blackout Periods */}
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg border border-white/35 dark:border-white/10 rounded-3xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Restricted Periods</h2>
                <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 text-xs rounded-full">
                  {blackoutPeriods.length} active
                </span>
              </div>
              <div className="space-y-3">
                {blackoutPeriods.map((period) => (
                  <div key={period.id} className={`p-3 rounded-lg ${
                    period.restrictionLevel === 'no-leave' 
                      ? 'bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-700'
                      : 'bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700'
                  }`}>
                    <div className="flex items-start gap-2">
                      <iconify-icon 
                        icon={period.restrictionLevel === 'no-leave' ? 'ph:prohibit-duotone' : 'ph:warning-duotone'} 
                        className={
                          period.restrictionLevel === 'no-leave' 
                            ? 'text-rose-500 mt-0.5' 
                            : 'text-amber-500 mt-0.5'
                        }
                      ></iconify-icon>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{period.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {new Date(period.startDate).toLocaleDateString()} - {new Date(period.endDate).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{period.reason}</p>
                        <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                          period.restrictionLevel === 'no-leave'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-800 dark:text-rose-200'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-200'
                        }`}>
                          {period.restrictionLevel === 'no-leave' ? 'Leave Not Allowed' : 'Restricted Leave'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {blackoutPeriods.length === 0 && (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    <iconify-icon icon="ph:calendar-check-duotone" className="text-2xl mb-2"></iconify-icon>
                    <p className="text-sm">No restricted periods</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg border border-white/35 dark:border-white/10 rounded-3xl p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                <button className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                  <iconify-icon icon="ph:calendar-plus-duotone" className="text-blue-500 text-xl mb-1"></iconify-icon>
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Quick Request</span>
                </button>
                <button className="p-3 bg-green-50 dark:bg-green-900/30 rounded-xl border border-green-200 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors">
                  <iconify-icon icon="ph:clock-counter-clockwise-duotone" className="text-green-500 text-xl mb-1"></iconify-icon>
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">Request History</span>
                </button>
                <button className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-xl border border-purple-200 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors">
                  <iconify-icon icon="ph:question-duotone" className="text-purple-500 text-xl mb-1"></iconify-icon>
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Help & Support</span>
                </button>
                <button className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-xl border border-amber-200 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors">
                  <iconify-icon icon="ph:download-duotone" className="text-amber-500 text-xl mb-1"></iconify-icon>
                  <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Export Data</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <footer className="pb-8 pt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
          © IntelliHRTrack • Employee Leave Portal
        </footer>
      </main>
    </div>
  );
}