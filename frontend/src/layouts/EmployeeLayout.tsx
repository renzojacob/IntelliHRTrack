import { Outlet, Link, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import DecorativeBlobs from '../components/common/DecorativeBlobs'
import { toggleTheme } from '../utils/theme'

export default function EmployeeLayout() {
  const { user, logout } = useAuthStore()
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/employee/dashboard', icon: 'ph:squares-four-duotone' },
    { name: 'ATTENDANCE', href: '/employee/attendance', icon: 'ph:fingerprint-simple-duotone' },
    { name: 'SCHEDULING & SHIFTS', href: '/employee/schedules', icon: 'ph:calendar-check-duotone' },
    { name: 'LEAVE & REQUEST', href: '/employee/leaves', icon: 'ph:airplane-tilt-duotone' },
    { name: 'PAYROLL & FINANCE', href: '/employee/payroll', icon: 'ph:currency-dollar-duotone' },
    { name: 'ANALYTICS', href: '/employee/analytics', icon: 'ph:brain-duotone' },
    { name: 'NOTIFICATIONS', href: '/employee/notifications', icon: 'ph:bell-duotone' },
    { name: 'SETTINGS & PROFILE', href: '/employee/profile', icon: 'ph:user-circle-duotone' },
  ]

  const isActive = (path: string) => location.pathname === path

  useEffect(() => {
    if (typeof window === 'undefined') return

    const elements = Array.from(document.querySelectorAll<HTMLElement>('.reveal'))
    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement
          if (entry.isIntersecting) {
            el.classList.add('in-view')
            observer.unobserve(el)
          }
        })
      },
      { threshold: 0.08 },
    )

    elements.forEach((el) => observer.observe(el))

    // fallback: reveal elements already in viewport
    elements.forEach((el) => {
      const rect = el.getBoundingClientRect()
      if (rect.top >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)) {
        el.classList.add('in-view')
      }
    })

    return () => observer.disconnect()
  }, [])

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
                <p className="text-xs text-gray-500 dark:text-gray-400">Employee Dashboard</p>
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
                    <p className="text-xs text-gray-500 dark:text-gray-400">Employee</p>
                  </div>
                </div>
                <button
                  onClick={logout}
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