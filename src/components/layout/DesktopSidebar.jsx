import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/* SVG icons — no unicode characters */
const HomeIcon = ({ active }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d="M2.5 10L10 3.5L17.5 10V17C17.5 17.276 17.276 17.5 17 17.5H13V13H7V17.5H3C2.724 17.5 2.5 17.276 2.5 17V10Z"
      fill={active ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const SearchIcon = ({ active }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.15 : 0}/>
    <path d="M17 17L13.5 13.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
)

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M9 2V16M2 9H16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
  </svg>
)

const ProfileIcon = ({ active }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle
      cx="10" cy="7" r="3.5"
      fill={active ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <path
      d="M3.5 17C3.5 14 6.46 11.5 10 11.5C13.54 11.5 16.5 14 16.5 17"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
)

const SettingsIcon = ({ active }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.6" fill={active ? 'currentColor' : 'none'}/>
    <path
      d="M10 2v1.5M10 16.5V18M2 10h1.5M16.5 10H18M3.757 3.757l1.06 1.06M15.182 15.182l1.06 1.06M3.757 16.243l1.06-1.06M15.182 4.818l1.06-1.06"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
)

const NAV_ITEMS = [
  { to: '/',        label: 'Home',       Icon: HomeIcon    },
  { to: '/search',  label: 'Search',     Icon: SearchIcon  },
  { to: '/create',  label: 'Post Event', Icon: PlusIcon, isCreate: true },
  { to: '/profile', label: 'Profile',    Icon: ProfileIcon },
  { to: '/settings',label: 'Settings',   Icon: SettingsIcon},
]

export default function DesktopSidebar() {
  const location = useLocation()
  const { user } = useAuth()

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/'
    return location.pathname.startsWith(to)
  }

  return (
    <aside className="sidebar show-desktop" style={{ display: 'none' }}>
      <div className="sidebar__header-spacer" />

      <nav className="sidebar__nav">
        {NAV_ITEMS.map(({ to, label, Icon, isCreate }) => {
          const active = isActive(to)
          const linkTo = (to === '/profile' && !user) ? '/login' : to

          return (
            <Link
              key={to}
              to={linkTo}
              className={`sidebar__item ${active ? 'sidebar__item--active' : ''} ${isCreate ? 'sidebar__item--create' : ''}`}
            >
              <span className="sidebar__item-icon">
                <Icon active={active} />
              </span>
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
          padding: 0 var(--space-md) var(--space-lg);
          background: var(--bg);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
          z-index: 90;
          transition: background var(--transition-slow);
        }

        @media (min-width: 1100px) {
          .sidebar { width: 260px; padding: 0 var(--space-lg) var(--space-lg); }
        }

        .sidebar__header-spacer {
          height: calc(var(--header-h) + var(--safe-top) + var(--space-md));
          flex-shrink: 0;
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
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .sidebar__item-label { line-height: 1; }

        .sidebar__bottom { margin-top: auto; }
      `}</style>
    </aside>
  )
}
