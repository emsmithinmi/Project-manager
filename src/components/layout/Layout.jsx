import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/daily',     label: 'Daily',     icon: '📅' },
  { to: '/tasks',     label: 'Tasks',     icon: '⚡' },
  { to: '/projects',  label: 'Projects',  icon: '🗂' },
  { to: '/people',    label: 'People',    icon: '👥' },
  { to: '/habits',    label: 'Habits',    icon: '🎯' },
  { to: '/reviews',   label: 'Reviews',   icon: '🔍' },
]

export default function Layout() {
  const { user, signOut } = useAuth()

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#1e1e2e' }}>
      {/* Sidebar */}
      <aside
        className="flex flex-col w-56 shrink-0 border-r"
        style={{ backgroundColor: '#181825', borderColor: '#313244' }}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b" style={{ borderColor: '#313244' }}>
          <h1 className="text-lg font-semibold" style={{ color: '#cdd6f4' }}>
            GTD
          </h1>
          <p className="text-xs mt-0.5" style={{ color: '#6c7086' }}>
            Getting Things Done
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive ? 'font-medium' : 'hover:opacity-80'
                }`
              }
              style={({ isActive }) => ({
                backgroundColor: isActive ? '#313244' : 'transparent',
                color: isActive ? '#cdd6f4' : '#6c7086',
              })}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User / Sign out */}
        <div
          className="px-4 py-3 border-t space-y-2"
          style={{ borderColor: '#313244' }}
        >
          {user && (
            <p
              className="text-xs truncate"
              style={{ color: '#6c7086' }}
              title={user.email}
            >
              {user.email}
            </p>
          )}
          <button
            onClick={signOut}
            className="w-full text-left text-xs px-2 py-1.5 rounded-md transition-colors hover:opacity-80"
            style={{ color: '#6c7086', backgroundColor: '#313244' }}
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
