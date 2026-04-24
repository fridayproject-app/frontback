import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Sign in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <h1 className="auth-brand__name">Friday</h1>
          <p className="auth-brand__tagline">Your city's pulse.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <h2 className="auth-form__title">Sign in</h2>

          {error && (
            <div className="auth-error">{error}</div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              autoComplete="email"
              inputMode="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 4 }}
            disabled={loading}
          >
            {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : 'Sign In'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{' '}
          <Link to="/signup" className="auth-switch__link">Create one</Link>
        </p>

        <button className="auth-guest" onClick={() => navigate('/')}>
          Browse as guest →
        </button>
      </div>

      <style>{`
        .auth-page {
          min-height: 100dvh;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-lg);
          background: var(--bg);
        }

        .auth-card {
          width: 100%;
          max-width: 380px;
          display: flex;
          flex-direction: column;
          gap: var(--space-xl);
          animation: scaleIn 0.3s var(--spring);
        }

        .auth-brand { text-align: center; }

        .auth-brand__name {
          font-size: 52px;
          font-weight: 900;
          letter-spacing: -0.06em;
          color: var(--text-primary);
          line-height: 1;
        }

        .auth-brand__tagline {
          font-size: 16px;
          color: var(--text-tertiary);
          margin-top: var(--space-sm);
        }

        .auth-form {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          padding: var(--space-xl);
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .auth-form__title {
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.03em;
        }

        .auth-error {
          padding: 12px;
          background: rgba(255, 59, 48, 0.1);
          border: 1px solid rgba(255, 59, 48, 0.2);
          border-radius: var(--radius-sm);
          font-size: 13px;
          color: #ff3b30;
          font-weight: 500;
        }

        .auth-switch {
          text-align: center;
          font-size: 14px;
          color: var(--text-secondary);
        }

        .auth-switch__link {
          color: var(--text-primary);
          font-weight: 700;
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        .auth-guest {
          text-align: center;
          font-size: 14px;
          color: var(--text-tertiary);
          font-weight: 500;
          margin-top: -8px;
          transition: color var(--transition);
          cursor: pointer;
          background: none;
          border: none;
        }

        .auth-guest:hover { color: var(--text-secondary); }
      `}</style>
    </div>
  )
}
