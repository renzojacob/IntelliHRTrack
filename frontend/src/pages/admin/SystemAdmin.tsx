import { useEffect, useMemo, useRef, useState } from 'react'

type ToastItem = { id: number; message: string; type?: 'info' | 'success' | 'warning' | 'danger' }

export default function SystemAdmin() {
  const [showSettings, setShowSettings] = useState(false)
  const [showAIModal, setShowAIModal] = useState(false)
  const [showAddUser, setShowAddUser] = useState(false)
  const [showBackup, setShowBackup] = useState(false)
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const toastId = useRef(1)

  const [sidebarWidth, setSidebarWidth] = useState<number>(() => parseInt(localStorage.getItem('ih_sidebar_w') || '288', 10))
  const [accent, setAccent] = useState<string>(() => localStorage.getItem('ih_accent') || 'teal')
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('ih_theme') as 'dark' | 'light') || (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))
  const [density, setDensity] = useState<string>(() => localStorage.getItem('ih_density') || 'comfortable')
  const [glassAlpha, setGlassAlpha] = useState<number>(() => parseFloat(localStorage.getItem('ih_glassA') || '0.6'))

  const [backupProgress, setBackupProgress] = useState<number>(0)

  useEffect(() => {
    // apply theme
    if (theme === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
    localStorage.setItem('ih_theme', theme)
  }, [theme])

  useEffect(() => {
    // apply accent variables
    const map: Record<string, [string, string]> = {
      teal: ['#14b8a6', '#0ea5a0'],
      purple: ['#8b5cf6', '#7c3aed'],
      rose: ['#f43f5e', '#e11d48'],
      amber: ['#f59e0b', '#d97706'],
    }
    const pair = map[accent] || map.teal
    document.documentElement.style.setProperty('--accent', pair[0])
    document.documentElement.style.setProperty('--accent-to', pair[1])
    localStorage.setItem('ih_accent', accent)
  }, [accent])

  useEffect(() => {
    document.documentElement.dataset.density = density
    localStorage.setItem('ih_density', density)
  }, [density])

  useEffect(() => {
    localStorage.setItem('ih_sidebar_w', String(sidebarWidth))
    const aside = document.querySelector('aside[data-resizable]') as HTMLElement | null
    const shiftEl = document.querySelector('[data-shift]') as HTMLElement | null
    if (aside) aside.style.width = `${sidebarWidth}px`
    if (shiftEl && window.innerWidth >= 1024) shiftEl.style.marginLeft = `${sidebarWidth}px`
  }, [sidebarWidth])

  useEffect(() => {
    // apply glass alpha
    let style = document.getElementById('glassStyleOverride') as HTMLStyleElement | null
    if (!style) { style = document.createElement('style'); style.id = 'glassStyleOverride'; document.head.appendChild(style) }
    const a = Math.min(0.9, Math.max(0.3, glassAlpha || 0.6))
    style.textContent = `.glass{background:linear-gradient(180deg, rgba(255,255,255,${a}), rgba(255,255,255,${Math.max(0,a-0.06)}));backdrop-filter:blur(10px)} .dark .glass{background:linear-gradient(180deg, rgba(31,41,55,${Math.min(0.9,a+0.06)}), rgba(31,41,55,${a}))}`
    localStorage.setItem('ih_glassA', String(a))
  }, [glassAlpha])

  const showToast = (message: string, type: ToastItem['type'] = 'info') => {
    const id = toastId.current++
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }

  const startBackup = () => {
    setShowBackup(true)
    setBackupProgress(0)
    showToast('Starting backup process', 'info')
    const iv = setInterval(() => {
      setBackupProgress(p => {
        if (p >= 100) { clearInterval(iv); showToast('Backup completed', 'success'); return 100 }
        return Math.min(100, p + Math.floor(10 + Math.random() * 20))
      })
    }, 700)
  }

  const resetSettings = () => {
    localStorage.removeItem('ih_accent')
    localStorage.removeItem('ih_theme')
    localStorage.removeItem('ih_density')
    localStorage.removeItem('ih_sidebar_w')
    localStorage.removeItem('ih_glassA')
    setAccent('teal')
    setTheme('light')
    setDensity('comfortable')
    setSidebarWidth(288)
    setGlassAlpha(0.6)
    showToast('Settings reset', 'success')
  }

  // simple clock
  const [clock, setClock] = useState(() => new Date().toLocaleTimeString())
  useEffect(() => { const t = setInterval(() => setClock(new Date().toLocaleTimeString()), 1000); return () => clearInterval(t) }, [])

  const tabIds = ['overview', 'users', 'security', 'backups', 'logs']
  const [activeTab, setActiveTab] = useState<string>('overview')

  const tabContent = useMemo(() => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-4">
            <div className="glass rounded-2xl p-4">
              <h3 className="font-semibold">System Status</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">All core services are running. Device heartbeat: OK.</p>
            </div>
            <div className="glass rounded-2xl p-4">
              <h3 className="font-semibold">Recent Security Alerts</h3>
              <ul className="text-sm space-y-2 mt-2">
                <li className="flex justify-between"><span>Multiple failed login attempts</span><span className="text-xs text-amber-600">Investigate</span></li>
                <li className="flex justify-between"><span>Device offline: Terminal-03</span><span className="text-xs text-red-600">Offline</span></li>
              </ul>
            </div>
          </div>
        )
      case 'users':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">User Directory</h3>
              <div className="flex gap-2">
                <button onClick={() => setShowAddUser(true)} className="px-4 py-2 rounded-xl text-white bg-gradient-to-r from-blue-500 to-indigo-600">Add User</button>
                <button className="px-3 py-2 rounded-xl glass">Export</button>
              </div>
            </div>
            <div className="glass rounded-2xl p-4">
              <table className="min-w-full text-sm">
                <thead className="text-left text-xs text-gray-500"><tr><th className="px-3 py-2">Name</th><th className="px-3 py-2">Role</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Actions</th></tr></thead>
                <tbody className="divide-y">
                  <tr><td className="px-3 py-2">Admin User</td><td className="px-3 py-2">Administrator</td><td className="px-3 py-2">Active</td><td className="px-3 py-2"><button className="px-3 py-1 rounded-lg glass">Edit</button></td></tr>
                  <tr><td className="px-3 py-2">Payroll Bot</td><td className="px-3 py-2">Service Account</td><td className="px-3 py-2">Active</td><td className="px-3 py-2"><button className="px-3 py-1 rounded-lg glass">Edit</button></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        )
      case 'security':
        return (
          <div className="space-y-4">
            <div className="glass rounded-2xl p-4">
              <h3 className="font-semibold">Security Settings</h3>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2"><div className="text-xs text-gray-500">Require MFA</div><div><label className="inline-flex items-center gap-2"><input type="checkbox" defaultChecked className="w-4 h-4" /> Enforce for admins</label></div></div>
                <div className="space-y-2"><div className="text-xs text-gray-500">Password Policy</div><div className="text-sm">Min 10 chars, complexity enforced</div></div>
              </div>
            </div>
            <div className="glass rounded-2xl p-4">
              <h3 className="font-semibold">Audit & Logs</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Retention: 365 days. Exportable for compliance.</p>
            </div>
          </div>
        )
      case 'backups':
        return (
          <div className="space-y-4">
            <div className="glass rounded-2xl p-4">
              <h3 className="font-semibold">Run Backup</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Backup system snapshot for audits and recovery.</p>
              <div className="mt-3 flex gap-2">
                <button onClick={startBackup} className="px-4 py-2 rounded-xl text-white bg-emerald-500">Start Backup</button>
                <button onClick={() => showToast('Downloading last backup...', 'info')} className="px-4 py-2 rounded-xl glass">Download Backup</button>
              </div>
            </div>
            <div className="glass rounded-2xl p-4">
              <h3 className="font-semibold">Scheduled Backups</h3>
              <p className="text-sm">Daily at 02:00 • Last: 2 hours ago</p>
            </div>
          </div>
        )
      case 'logs':
        return (
          <div className="space-y-4">
            <div className="glass rounded-2xl p-4">
              <h3 className="font-semibold">System Logs</h3>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">Showing last 100 events • searchable</div>
              <div className="mt-3 max-h-48 overflow-auto fancy-scroll text-xs">
                <div>[2025-11-24 09:23] User admin logged in</div>
                <div>[2025-11-24 09:21] Backup completed</div>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }, [activeTab])

  return (
    <div className="space-y-6">
      <div id="topProgress" className="topbar-progress" style={{ height: 3 }} />

      {/* Hero */}
      <header className="relative overflow-hidden rounded-3xl glass p-6 md:p-8 shadow-glow">
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">System Administration</h2>
            <p className="mt-1 text-sm md:text-base text-gray-600 dark:text-gray-300">Manage users, access control, security, and system settings</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl glass text-xs">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${navigator.onLine ? 'bg-green-500' : 'bg-red-500'}`} title={navigator.onLine ? 'Online' : 'Offline'}></span>
              <div className="font-mono text-xs">{clock}</div>
            </div>
            <button onClick={() => setShowAIModal(true)} className="px-3 py-2 rounded-xl glass">AI Assistant</button>
            <button onClick={() => setShowSettings(true)} className="px-3 py-2 rounded-xl glass">Customize</button>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-12 gap-6">
        <div className="col-span-12 xl:col-span-8 space-y-6">
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-4">
              {tabIds.map(id => (
                <button key={id} id={`${id}-tab`} onClick={() => setActiveTab(id)} className={`admin-tab px-3 py-2 rounded-md border ${activeTab === id ? 'border-amber-500 text-amber-500' : 'border-transparent text-gray-500'}`}>{id.charAt(0).toUpperCase() + id.slice(1)}</button>
              ))}
            </div>
          </div>

          {tabContent}
        </div>

        <div className="col-span-12 xl:col-span-4 space-y-6">
          <div className="glass rounded-2xl p-4">
            <h3 className="font-semibold">System Health</h3>
            <div className="mt-2 text-sm">Uptime: 99.98% • Devices online: 24/25</div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button onClick={() => showToast('Diagnostics started', 'info')} className="px-3 py-2 rounded-md glass">Run Diagnostics</button>
              <button onClick={() => setShowBackup(true)} className="px-3 py-2 rounded-md bg-emerald-500 text-white">Run Backup</button>
            </div>
          </div>

          <div className="glass rounded-2xl p-4">
            <h3 className="font-semibold">Audit Snapshot</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Capture quick system snapshot for audits and compliance.</p>
            <div className="mt-3 grid gap-2">
              <button onClick={() => showToast('Captured snapshot', 'success')} className="px-3 py-2 rounded-xl bg-emerald-500 text-white">Capture Snapshot</button>
              <button onClick={() => showToast('Downloading JSON', 'info')} className="px-3 py-2 rounded-xl glass">Download JSON</button>
            </div>
            <div className="mt-2 text-xs text-gray-400">Last captured: —</div>
          </div>
        </div>
      </section>

      <footer className="pb-8 pt-2 text-xs text-gray-500 dark:text-gray-400 text-center">© IntelliHRTrack • System Administration</footer>

      {/* Toast Host */}
      <div id="toastContainer" className="fixed bottom-6 right-6 space-y-2 z-50 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`pointer-events-auto px-4 py-3 rounded-lg border ${t.type==='success'? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700': t.type==='warning'? 'bg-amber-50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700': t.type==='danger'?'bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700':'bg-white dark:bg-gray-800 border-white/40 dark:border-gray-700/60'}`}>
            {t.message}
          </div>
        ))}
      </div>

      {/* AI Assistant Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-4"><h3 className="text-xl font-bold">AI Assistant</h3><button onClick={()=>setShowAIModal(false)} className="text-gray-500 hover:text-gray-300">✕</button></div>
            <div className="mb-4"><p className="text-gray-700 dark:text-gray-300">Hello! I'm your AI assistant. How can I help you with system administration today?</p></div>
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 mb-4"><p className="text-sm text-gray-700 dark:text-gray-300">System Status Summary: All systems are running optimally. No critical issues detected. 3 security alerts require attention.</p></div>
            <div className="flex space-x-3"><button onClick={()=>{ setShowAIModal(false); showToast('Opening security alerts', 'info') }} className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg">View Security Alerts</button><button onClick={()=>{ setShowAIModal(false); showToast('Generating report', 'info') }} className="flex-1 px-4 py-2 glass rounded-lg">Generate Report</button></div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4"><h3 className="text-xl font-bold">Add New User</h3><button onClick={()=>setShowAddUser(false)} className="text-gray-500 hover:text-gray-300">✕</button></div>
            <div className="space-y-4">
              <input className="w-full p-3 rounded border bg-transparent" placeholder="Full name" />
              <input className="w-full p-3 rounded border bg-transparent" placeholder="Email" />
              <select className="w-full p-3 rounded border bg-transparent"><option>Administrator</option><option>HR</option><option>Payroll</option><option>Employee</option></select>
            </div>
            <div className="flex space-x-3 mt-6"><button onClick={()=>{ setShowAddUser(false); showToast('User created (demo)', 'success') }} className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg">Create User</button><button onClick={()=>setShowAddUser(false)} className="flex-1 px-4 py-2 glass rounded-lg">Cancel</button></div>
          </div>
        </div>
      )}

      {/* Backup Progress Modal */}
      {showBackup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4"><h3 className="text-xl font-bold">Running Backup</h3><button onClick={()=>setShowBackup(false)} className="text-gray-500 hover:text-gray-300">✕</button></div>
            <div className="mb-4"><p className="text-gray-700 dark:text-gray-300">System backup in progress. Please wait...</p></div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4"><div className="bg-green-500 h-2 rounded-full" style={{ width: `${backupProgress}%` }} /></div>
            <div className="text-center"><p className="text-sm text-gray-600 dark:text-gray-400">{backupProgress}%</p></div>
          </div>
        </div>
      )}

      {/* Settings Panel (drawer-like) */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowSettings(false)}></div>
          <div className="relative z-10 w-full max-w-lg glass rounded-2xl p-6">
            <div className="flex items-center justify-between"><h3 className="font-semibold">Customize Layout</h3><button onClick={()=>setShowSettings(false)} className="px-2 py-1 glass rounded">Close</button></div>
            <div className="neon-divider my-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-wide text-gray-500">Accent color</div>
                <div className="flex gap-2">
                  {['teal','purple','rose','amber'].map(a => (
                    <button key={a} data-accent={a} onClick={() => setAccent(a)} className="w-10 h-10 rounded-xl border-2 border-white/60" style={{ background: a==='teal'?'#14b8a6':a==='purple'?'#8b5cf6':a==='rose'?'#f43f5e':'#f59e0b' }} />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-wide text-gray-500">Background</div>
                <div className="flex gap-2"><button onClick={() => { document.body.style.backgroundImage = ''; localStorage.setItem('ih_bg','gradient') }} className="px-3 py-2 rounded-xl glass">Gradient</button><button onClick={() => { document.body.style.backgroundImage = "url('')"; localStorage.setItem('ih_bg','image') }} className="px-3 py-2 rounded-xl glass">Image</button></div>
              </div>
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-wide text-gray-500">Density</div>
                <div className="flex gap-2"><button onClick={()=>setDensity('comfortable')} className="px-3 py-2 rounded-xl glass">Comfortable</button><button onClick={()=>setDensity('compact')} className="px-3 py-2 rounded-xl glass">Compact</button></div>
              </div>
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-wide text-gray-500">Motion</div>
                <label className="flex items-center gap-2 text-sm"><input defaultChecked={false} onChange={(e)=> document.documentElement.classList.toggle('reduce-motion', e.target.checked)} type="checkbox" className="w-4 h-4" /> Reduce motion</label>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xs uppercase tracking-wide text-gray-500">Glass intensity</div>
              <input type="range" min={0.3} max={0.9} step={0.01} value={glassAlpha} onChange={(e)=> setGlassAlpha(parseFloat(e.target.value))} className="w-full" />
            </div>
            <div className="mt-6 flex justify-end gap-2"><button onClick={resetSettings} className="px-3 py-2 rounded-xl glass">Reset</button><button onClick={()=>{ setShowSettings(false); showToast('Saved settings', 'success') }} className="px-3 py-2 rounded-xl text-white bg-accent">Save</button></div>
          </div>
        </div>
      )}
    </div>
  )
}




