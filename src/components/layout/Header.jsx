import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'

export default function Header() {
  const { resolvedTheme } = useTheme()
  const { user } = useAuth()
  const location = useLocation()

  const logoSrc = resolvedTheme === 'dark'
    ? '/images/black background.png'
    : '/images/white background.png'

  const getTitle = () => {
    const path = location.pathname
    if (path === '/') return null // show logo
    if (path === '/search') return 'Search'
    if (path === '/create') return 'New Post'
    if (path.startsWith('/profile')) return 'Profile'
    if (path === '/settings') return 'Settings'
    if (path.startsWith('/post/')) return 'Event'
    return null
  }

  const pageTitle = getTitle()

  return (
    <header className="header">
      <div className="header__inner container">
        {pageTitle ? (
          <>
            <button className="header__back" onClick={() => window.history.back()}>
              <svg width="10" height="17" viewBox="0 0 10 17" fill="none">
                <path d="M8.5 1.5L1.5 8.5L8.5 15.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <span className="header__title">{pageTitle}</span>
            <div className="header__right" />
          </>
        ) : (
          <>
            <Link to="/" className="header__logo-link">
              <img
                src={logoSrc}
                alt="Friday"
                className="header__logo"
                onError={e => { e.target.style.display = 'none' }}
              />
              <span className="header__logo-text">Friday</span>
            </Link>
            <div className="header__right">
              {!user && (
                <Link to="/login" className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 14 }}>
                  Sign in
                </Link>
              )}
            </div>
          </>
        )}
      </div>

      <style>{`
        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: var(--header-h);
          padding-top: var(--safe-top);
          background: var(--header-bg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--nav-border);
          z-index: 100;
          transition: background var(--transition-slow);
        }

        .header__inner {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-md);
        }

        .header__logo-link {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          text-decoration: none;
        }

        .header__logo {
          height: 28px;
          width: auto;
          object-fit: contain;
        }

        .header__logo-text {
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.04em;
          color: var(--text-primary);
        }

        .header__title {
          font-size: 17px;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--text-primary);
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
        }

        .header__back {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          color: var(--text-primary);
          background: var(--accent-muted);
          transition: all var(--transition);
        }

        .header__back:hover {
          background: var(--accent-hover);
        }

        .header__right {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          min-width: 36px;
          justify-content: flex-end;
        }
      `}</style>
    </header>
  )
}
