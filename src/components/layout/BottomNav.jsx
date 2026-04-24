import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const NAV_ITEMS = [
  {
    to: '/',
    label: 'Home',
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 12L12 4L21 12V20C21 20.5523 20.5523 21 20 21H15V16H9V21H4C3.44772 21 3 20.5523 3 20V12Z"
          fill={active ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
  {
    to: '/search',
    label: 'Search',
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle
          cx="11" cy="11" r="7"
          fill={active ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.8"
          opacity={active ? 0.15 : 1}
        />
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M21 21L16.5 16.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    )
  },
  {
    to: '/create',
    label: 'Post',
    icon: (_active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" fill="currentColor"/>
        <path d="M12 8V16M8 12H16" stroke="var(--bg)" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    isCreate: true,
  },
  {
    to: '/profile',
    label: 'Profile',
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle
          cx="12" cy="8" r="3.5"
          fill={active ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M5 19C5 16.2386 8.13401 14 12 14C15.866 14 19 16.2386 19 19"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    )
  },
  {
    to: '/settings',
    label: 'Settings',
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.8" fill={active ? 'currentColor' : 'none'}/>
        <path
          d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity={active ? 0 : 1}
        />
        <path
          d="M9.17 4.17A5.001 5.001 0 0112 3a5.001 5.001 0 012.83 1.17M19.83 9.17A5.001 5.001 0 0121 12a5.001 5.001 0 01-1.17 2.83M14.83 19.83A5.001 5.001 0 0112 21a5.001 5.001 0 01-2.83-1.17M4.17 14.83A5.001 5.001 0 013 12a5.001 5.001 0 011.17-2.83"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity={active ? 1 : 0}
        />
      </svg>
    )
  },
]

export default function BottomNav() {
  const location = useLocation()
  const { user } = useAuth()

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/'
    return location.pathname.startsWith(to)
  }

  return (
    <nav className="bottom-nav hide-desktop">
      {NAV_ITEMS.map(({ to, label, icon, isCreate }) => {
        const active = isActive(to)
        const linkTo = (to === '/profile' && !user) ? '/login' : to

        return (
          <Link
            key={to}
            to={linkTo}
            className={`bottom-nav__item ${active ? 'bottom-nav__item--active' : ''} ${isCreate ? 'bottom-nav__item--create' : ''}`}
          >
            <span className="bottom-nav__icon">{icon(active)}</span>
            {!isCreate && <span className="bottom-nav__label">{label}</span>}
          </Link>
        )
      })}

      <style>{`
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: calc(var(--bottom-nav-h) + var(--safe-bottom));
          padding-bottom: var(--safe-bottom);
          background: var(--nav-bg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid var(--nav-border);
          display: flex;
          align-items: stretch;
          z-index: 100;
          transition: background var(--transition-slow);
        }

        .bottom-nav__item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          color: var(--text-tertiary);
          text-decoration: none;
          transition: color var(--transition), transform var(--transition);
          -webkit-tap-highlight-color: transparent;
          padding: var(--space-sm) 0;
        }

        .bottom-nav__item:active {
          transform: scale(0.88);
        }

        .bottom-nav__item--active {
          color: var(--text-primary);
        }

        .bottom-nav__item--create {
          color: var(--text-primary);
        }

        .bottom-nav__icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
        }

        .bottom-nav__label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.01em;
        }
      `}</style>
    </nav>
  )
}
