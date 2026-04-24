import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

function SettingsRow({ label, value, onClick, href, danger, rightEl }) {
  const inner = (
    <div className={`settings-row ${danger ? 'settings-row--danger' : ''}`} onClick={onClick}>
      <span className="settings-row__label">{label}</span>
      <div className="settings-row__right">
        {value && <span className="settings-row__value">{value}</span>}
        {rightEl}
        {(onClick || href) && !rightEl && (
          <svg width="7" height="12" viewBox="0 0 7 12" fill="none" className="settings-row__chevron">
            <path d="M1 1l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
    </div>
  )
  if (href) return <Link to={href} style={{ textDecoration: 'none' }}>{inner}</Link>
  return inner
}

function SettingsSection({ title, children }) {
  return (
    <div className="settings-section">
      {title && <h3 className="settings-section__title">{title}</h3>}
      <div className="settings-section__card">
        {children}
      </div>
    </div>
  )
}

function LegalPage({ title, onBack }) {
  const content = {
    'Terms of Use': `Last updated: August 2025\n\nBy using Friday, you agree to these Terms of Use. Friday is a platform for discovering and sharing events in Gaborone, Botswana.\n\nYou must be 18 or older to use Friday. You are responsible for all content you post. Friday reserves the right to remove content that violates our Community Guidelines.\n\nWe may update these terms at any time. Continued use of Friday constitutes acceptance of any changes.`,
    'Privacy Policy': `Last updated: August 2025\n\nFriday collects only the information needed to operate the service: your email address, username, and content you post.\n\nWe do not sell your data. We use Supabase for authentication and data storage. Data may be stored in servers outside Botswana.\n\nYou can delete your account at any time by contacting us.`,
    'Community Guidelines': `Friday is a community for people in Gaborone to discover and share events. We expect all users to:\n\n• Post only real events or happenings\n• Be respectful in comments and interactions\n• Not post spam, misleading, or harmful content\n• Not impersonate other people or businesses\n• Not post content that violates Botswana law\n\nViolations may result in removal of content or account suspension.`,
    'Safety': `Your safety matters to us.\n\nNever share your personal address publicly. Use the WhatsApp or call features to coordinate privately with hosts.\n\nIf you feel unsafe at any event, leave immediately and contact emergency services.\n\nTo report unsafe content or users on Friday, contact us at safety@friday.bw`,
    'Contact': `For support, feedback, or business enquiries:\n\n📧 hello@friday.bw\n📱 WhatsApp: +267 71 000 000\n🌐 gabs.friday.bw\n\nFor safety issues: safety@friday.bw\n\nFor press: press@friday.bw\n\nWe're based in Gaborone, Botswana 🇧🇼`,
  }

  return (
    <div className="legal-page">
      <div className="legal-page__header">
        <button className="header__back" onClick={onBack} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', background: 'var(--accent-muted)', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>
          <svg width="10" height="17" viewBox="0 0 10 17" fill="none">
            <path d="M8.5 1.5L1.5 8.5L8.5 15.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h2 className="legal-page__title">{title}</h2>
      </div>
      <div className="legal-page__content">
        {(content[title] || '').split('\n').map((line, i) => (
          <p key={i} className={line === '' ? 'legal-page__spacer' : 'legal-page__text'}>
            {line}
          </p>
        ))}
      </div>
      <style>{`
        .legal-page { animation: slideUp 0.25s ease; }
        .legal-page__header { display: flex; align-items: center; gap: var(--space-md); margin-bottom: var(--space-xl); }
        .legal-page__title { font-size: 22px; font-weight: 800; letter-spacing: -0.03em; }
        .legal-page__content { display: flex; flex-direction: column; gap: 4px; }
        .legal-page__text { font-size: 15px; line-height: 1.65; color: var(--text-secondary); }
        .legal-page__spacer { height: 8px; }
      `}</style>
    </div>
  )
}

export default function Settings() {
  const { theme, setTheme } = useTheme()
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [legalPage, setLegalPage] = useState(null)

  if (legalPage) {
    return (
      <div className="page">
        <div className="container" style={{ paddingTop: 'var(--space-lg)' }}>
          <LegalPage title={legalPage} onBack={() => setLegalPage(null)} />
        </div>
      </div>
    )
  }

  const THEME_OPTIONS = [
    { label: 'Dark', value: 'dark', icon: '🌙' },
    { label: 'Light', value: 'light', icon: '☀️' },
    { label: 'Device', value: 'device', icon: '📱' },
  ]

  const LEGAL_ITEMS = ['Terms of Use', 'Privacy Policy', 'Community Guidelines', 'Safety', 'Contact']

  return (
    <div className="page">
      <div className="settings-page container">
        <div className="settings-header">
          <h1 className="settings-header__title">Settings</h1>
        </div>

        {/* Account */}
        {user ? (
          <SettingsSection title="Account">
            <SettingsRow
              label="Profile"
              value={profile ? `@${profile.username}` : user.email}
              href="/profile"
            />
            <div className="settings-divider" />
            <SettingsRow label="Email" value={user.email} />
            <div className="settings-divider" />
            <SettingsRow
              label="Sign Out"
              danger
              onClick={async () => { await signOut(); navigate('/') }}
            />
          </SettingsSection>
        ) : (
          <SettingsSection title="Account">
            <SettingsRow label="Sign In" href="/login" />
            <div className="settings-divider" />
            <SettingsRow label="Create Account" href="/signup" />
          </SettingsSection>
        )}

        {/* Appearance */}
        <SettingsSection title="Appearance">
          <div className="settings-row">
            <span className="settings-row__label">Theme</span>
            <div className="theme-switcher">
              {THEME_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  className={`theme-btn ${theme === opt.value ? 'theme-btn--active' : ''}`}
                  onClick={() => setTheme(opt.value)}
                >
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </SettingsSection>

        {/* App Info */}
        <SettingsSection title="About">
          <SettingsRow label="Version" value="1.0.0" />
          <div className="settings-divider" />
          <SettingsRow label="City" value="Gaborone 🇧🇼" />
          <div className="settings-divider" />
          <SettingsRow
            label="Install App"
            value="Add to Home Screen"
            onClick={() => {
              if (window.deferredPrompt) {
                window.deferredPrompt.prompt()
              } else {
                alert('To install Friday: tap the Share button in your browser, then "Add to Home Screen".')
              }
            }}
          />
        </SettingsSection>

        {/* Legal */}
        <SettingsSection title="Legal & Support">
          {LEGAL_ITEMS.map((item, i) => (
            <div key={item}>
              {i > 0 && <div className="settings-divider" />}
              <SettingsRow label={item} onClick={() => setLegalPage(item)} />
            </div>
          ))}
        </SettingsSection>

        <p className="settings-footer">
          Friday · Gaborone, Botswana 🇧🇼<br />
          Made for the city 🌙
        </p>
      </div>

      <style>{`
        .settings-page {
          padding-top: var(--space-lg);
          padding-bottom: var(--space-2xl);
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .settings-header__title {
          font-size: 32px;
          font-weight: 900;
          letter-spacing: -0.04em;
          margin-bottom: var(--space-sm);
        }

        .settings-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .settings-section__title {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--text-tertiary);
          padding: 0 4px;
        }

        .settings-section__card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .settings-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px var(--space-md);
          cursor: pointer;
          transition: background var(--transition);
          gap: var(--space-md);
        }

        .settings-row:hover {
          background: var(--accent-muted);
        }

        .settings-row--danger .settings-row__label {
          color: #ff3b30;
        }

        .settings-row__label {
          font-size: 15px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .settings-row__right {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }

        .settings-row__value {
          font-size: 14px;
          color: var(--text-tertiary);
          max-width: 160px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .settings-row__chevron {
          color: var(--text-tertiary);
          flex-shrink: 0;
        }

        .settings-divider {
          height: 1px;
          background: var(--border);
          margin: 0 var(--space-md);
        }

        .theme-switcher {
          display: flex;
          gap: 4px;
          background: var(--bg-input);
          border-radius: var(--radius-md);
          padding: 3px;
        }

        .theme-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          padding: 7px 10px;
          border-radius: calc(var(--radius-md) - 3px);
          font-size: 11px;
          font-weight: 600;
          color: var(--text-secondary);
          font-family: var(--font);
          transition: all var(--transition);
          cursor: pointer;
        }

        .theme-btn span:first-child { font-size: 16px; }

        .theme-btn--active {
          background: var(--bg-card);
          color: var(--text-primary);
          box-shadow: 0 1px 4px rgba(0,0,0,0.15);
        }

        .settings-footer {
          text-align: center;
          font-size: 12px;
          color: var(--text-tertiary);
          line-height: 1.8;
          padding: var(--space-md) 0 var(--space-sm);
        }
      `}</style>
    </div>
  )
}
