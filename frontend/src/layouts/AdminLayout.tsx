import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import DecorativeBlobs from '../components/common/DecorativeBlobs'
import { toggleTheme } from '../utils/theme'

export default function AdminLayout() {
  const { user, logout } = useAuthStore()
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: 'ph:squares-four-duotone' },
    { name: 'BIOMETRICS & ATTENDANCE', href: '/admin/biometrics', icon: 'ph:fingerprint-simple-duotone' },
    { name: 'EMPLOYEE MANAGEMENT', href: '/admin/employees', icon: 'ph:users-three-duotone' },
    { name: 'SCHEDULING & SHIFTS', href: '/admin/schedules', icon: 'ph:calendar-check-duotone' },
    { name: 'LEAVE & ABSENCES', href: '/admin/leaves', icon: 'ph:airplane-tilt-duotone' },
    { name: 'PAYROLL & FINANCE', href: '/admin/payroll', icon: 'ph:currency-dollar-duotone' },
    { name: 'AI & WORKFORCE ANALYTICS', href: '/admin/analytics', icon: 'ph:brain-duotone' },
    { name: 'REPORTS & EXPORTS', href: '/admin/reports', icon: 'ph:graph-duotone' },
    { name: 'SYSTEM ADMINISTRATION', href: '/admin/system', icon: 'ph:gear-six-duotone' },
  ]

  const isActive = (path: string) => location.pathname === path
  const navigate = useNavigate()

  return (
    <div className="min-h-screen font-inter bg-gray-50/60 dark:bg-slate-950 text-gray-800 dark:text-gray-100">
      <DecorativeBlobs />

      <div id="app" className="min-h-screen flex">
        {/* Sidebar */}
        <aside
          data-resizable
          className="hidden lg:flex fixed left-0 top-0 h-screen w-72 flex-col gap-6 p-6 pr-3 overflow-y-auto fancy-scroll big-scroll"
        >
          <div className="glass rounded-2xl p-4 shadow-glow text-slate-800 dark:text-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl gradient-accent text-white flex items-center justify-center font-extrabold shadow-lg">
                TW
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight">Think Web</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Admin Command Center</p>
              </div>
            </div>
            <div className="neon-divider mt-4"></div>
            <nav className="mt-3">
              <ul className="space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl transition ${
                        isActive(item.href)
                          ? 'gradient-accent text-white shadow-glow'
                          : 'glass hover:shadow-glow'
                      }`}
                    >
                      <iconify-icon icon={item.icon} className="text-accent"></iconify-icon>
                      <span className={isActive(item.href) ? 'font-medium' : ''}>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="neon-divider my-4"></div>
            <div className="space-y-3">
              <button className="w-full px-3 py-2 text-white rounded-xl gradient-accent hover:shadow-glow ring-1 ring-white/30 transition flex items-center justify-center gap-2">
                <iconify-icon icon="ph:sliders-duotone"></iconify-icon>
                <span>Customize Layout</span>
              </button>
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                <span className="flex items-center gap-2">
                  <iconify-icon icon="ph:sun-dim-duotone" className="hidden dark:inline"></iconify-icon>
                  <iconify-icon icon="ph:moon-stars-duotone" className="dark:hidden"></iconify-icon>
                  Light / Dark
                </span>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-xl glass hover:shadow-glow transition flex items-center gap-2"
                >
                  <iconify-icon icon="ph:yin-yang-duotone" className="text-accent"></iconify-icon>
                  <span className="text-xs">Toggle</span>
                </button>
              </div>
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-semibold">
                    {user?.employee?.first_name?.charAt(0) || user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {user?.employee?.first_name} {user?.employee?.last_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout()
                    navigate('/')
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <iconify-icon icon="ph:sign-out-duotone" className="w-5 h-5 mr-2"></iconify-icon>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main data-shift className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 lg:ml-72">
          <Outlet />
        </main>
      </div>
    </div>
  )
}