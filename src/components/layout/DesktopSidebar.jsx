import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: '⌂' },
  { to: '/search', label: 'Search', icon: '⌕' },
  { to: '/create', label: 'Post Event', icon: '+', isCreate: true },
  { to: '/profile', label: 'Profile', icon: '◯' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
]

export default function DesktopSidebar() {
  const location = useLocation()
  const { user } = useAuth()
  const { resolvedTheme } = useTheme()

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/'
    return location.pathname.startsWith(to)
  }

  const logoSrc = resolvedTheme === 'dark'
    ? '/images/black background.png'
    : '/images/white background.png'

  return (
    <aside className="sidebar show-desktop" style={{ display: 'none' }}>
      <div className="sidebar__top">
        <Link to="/" className="sidebar__brand">
          <img
            src={logoSrc}
            alt="Friday"
            className="sidebar__logo"
            onError={e => { e.target.style.display = 'none' }}
          />
          <span className="sidebar__brand-name">Friday</span>
        </Link>
      </div>

      <nav className="sidebar__nav">
        {NAV_ITEMS.map(({ to, label, icon, isCreate }) => {
          const active = isActive(to)
          const linkTo = (to === '/profile' && !user) ? '/login' : to

          return (
            <Link
              key={to}
              to={linkTo}
              className={`sidebar__item ${active ? 'sidebar__item--active' : ''} ${isCreate ? 'sidebar__item--create' : ''}`}
            >
              <span className="sidebar__item-icon">{icon}</span>
              <span className="sidebar__item-label">{label}</span>
            </Link>
          )
        })}
      </nav>

      {!user && (
        <div className="sidebar__bottom">
          <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
            Sign In
          </Link>
        </div>
      )}

      <style>{`
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 220px;
          padding: calc(var(--safe-top) + var(--space-md)) var(--space-md) var(--space-lg);
          background: var(--bg);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
          z-index: 90;
          transition: background var(--transition-slow);
        }

        @media (min-width: 1100px) {
          .sidebar { width: 260px; padding: calc(var(--safe-top) + var(--space-md)) var(--space-lg) var(--space-lg); }
        }

        .sidebar__top { padding: var(--space-md) 0; }

        .sidebar__brand {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          text-decoration: none;
        }

        .sidebar__logo {
          height: 26px;
          width: auto;
        }

        .sidebar__brand-name {
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.04em;
          color: var(--text-primary);
        }

        .sidebar__nav {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
        }

        .sidebar__item {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: 12px var(--space-md);
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 15px;
          font-weight: 500;
          transition: all var(--transition);
        }

        .sidebar__item:hover {
          background: var(--accent-muted);
          color: var(--text-primary);
        }

        .sidebar__item--active {
          background: var(--accent-muted);
          color: var(--text-primary);
          font-weight: 700;
        }

        .sidebar__item--create {
          background: var(--accent);
          color: var(--accent-text);
          font-weight: 700;
          margin-top: var(--space-sm);
        }

        .sidebar__item--create:hover {
          opacity: 0.88;
          color: var(--accent-text);
        }

        .sidebar__item-icon {
          width: 22px;
          text-align: center;
          font-size: 18px;
          flex-shrink: 0;
        }

        .sidebar__item-label { line-height: 1; }

        .sidebar__bottom { margin-top: auto; }
      `}</style>
    </aside>
  )
}
