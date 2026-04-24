import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

export default function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', displayName: '', username: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (form.username.length < 3) return setError('Username must be at least 3 characters.')
    if (!/^[a-z0-9_.]+$/.test(form.username)) return setError('Username can only contain lowercase letters, numbers, . and _')
    if (form.password.length < 6) return setError('Password must be at least 6 characters.')

    setLoading(true)
    try {
      const { data } = await signUp(form.email, form.password)
      // Create profile
      if (data?.user) {
        await supabase.from('profiles').insert({
          user_id: data.user.id,
          username: form.username.toLowerCase(),
          display_name: form.displayName || form.username,
        })
      }
      setDone(true)
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-brand">
            <h1 className="auth-brand__name">Friday</h1>
          </div>
          <div className="auth-form" style={{ textAlign: 'center', gap: 'var(--space-md)' }}>
            <div style={{ fontSize: 48 }}>✉️</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em' }}>Check your email</h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              We sent a confirmation link to <strong>{form.email}</strong>. Click it to activate your account.
            </p>
            <Link to="/login" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }}>
              Back to Sign In
            </Link>
          </div>
        </div>
        <style>{`
          .auth-page { min-height:100dvh;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:var(--space-lg);background:var(--bg); }
          .auth-card { width:100%;max-width:380px;display:flex;flex-direction:column;gap:var(--space-xl);animation:scaleIn 0.3s var(--spring); }
          .auth-brand { text-align:center; }
          .auth-brand__name { font-size:52px;font-weight:900;letter-spacing:-0.06em;color:var(--text-primary);line-height:1; }
          .auth-form { background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-xl);padding:var(--space-xl);display:flex;flex-direction:column;gap:var(--space-md); }
        `}</style>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <h1 className="auth-brand__name">Friday</h1>
          <p className="auth-brand__tagline">Join the scene.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <h2 className="auth-form__title">Create account</h2>

          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label className="form-label">Display Name</label>
            <input
              type="text"
              className="form-input"
              value={form.displayName}
              onChange={set('displayName')}
              placeholder="Your name"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-input"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, '') }))}
              placeholder="your_handle"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={form.email}
              onChange={set('email')}
              placeholder="your@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={form.password}
              onChange={set('password')}
              placeholder="Min. 6 characters"
              required
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 4 }}
            disabled={loading}
          >
            {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login" className="auth-switch__link">Sign in</Link>
        </p>
      </div>

      <style>{`
        .auth-page { min-height:100dvh;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:var(--space-lg);background:var(--bg); }
        .auth-card { width:100%;max-width:380px;display:flex;flex-direction:column;gap:var(--space-xl);animation:scaleIn 0.3s var(--spring); }
        .auth-brand { text-align:center; }
        .auth-brand__name { font-size:52px;font-weight:900;letter-spacing:-0.06em;color:var(--text-primary);line-height:1; }
        .auth-brand__tagline { font-size:16px;color:var(--text-tertiary);margin-top:var(--space-sm); }
        .auth-form { background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-xl);padding:var(--space-xl);display:flex;flex-direction:column;gap:var(--space-md); }
        .auth-form__title { font-size:22px;font-weight:800;letter-spacing:-0.03em; }
        .auth-error { padding:12px;background:rgba(255,59,48,0.1);border:1px solid rgba(255,59,48,0.2);border-radius:var(--radius-sm);font-size:13px;color:#ff3b30;font-weight:500; }
        .auth-switch { text-align:center;font-size:14px;color:var(--text-secondary); }
        .auth-switch__link { color:var(--text-primary);font-weight:700;text-decoration:underline;text-underline-offset:2px; }
      `}</style>
    </div>
  )
}
