import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function ConfirmEmail() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('verifying') // verifying | success | error
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function confirm() {
      // Supabase sends token_hash + type in the URL
      const token_hash = searchParams.get('token_hash')
      const type = searchParams.get('type') // usually "email" or "signup"

      if (!token_hash || !type) {
        setStatus('error')
        setMessage('Invalid or missing confirmation link. Please request a new one.')
        return
      }

      const { error } = await supabase.auth.verifyOtp({ token_hash, type })

      if (error) {
        setStatus('error')
        setMessage(
          error.message.includes('expired')
            ? 'This link has expired. Please sign up again to get a new confirmation email.'
            : error.message || 'Something went wrong. Please try again.'
        )
      } else {
        setStatus('success')
        // Redirect to home after 2.5 seconds
        setTimeout(() => navigate('/'), 2500)
      }
    }

    confirm()
  }, [])

  return (
    <div className="confirm-page">
      <div className="confirm-card">
        {/* Logo / App name */}
        <div className="confirm-logo">
          <span className="confirm-logo__text">Friday</span>
        </div>

        {status === 'verifying' && (
          <div className="confirm-body">
            <div className="confirm-spinner" />
            <p className="confirm-title">Confirming your email…</p>
            <p className="confirm-sub">Just a moment</p>
          </div>
        )}

        {status === 'success' && (
          <div className="confirm-body">
            <div className="confirm-icon confirm-icon--success">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="16" fill="#34c759"/>
                <path d="M9 16.5L13.5 21L23 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="confirm-title">Email confirmed!</p>
            <p className="confirm-sub">Welcome to Friday. Taking you home…</p>
          </div>
        )}

        {status === 'error' && (
          <div className="confirm-body">
            <div className="confirm-icon confirm-icon--error">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="16" fill="#ff3b30"/>
                <path d="M11 11l10 10M21 11L11 21" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="confirm-title">Confirmation failed</p>
            <p className="confirm-sub">{message}</p>
            <div className="confirm-actions">
              <a href="/signup" className="btn btn-primary" style={{ width: '100%' }}>
                Sign Up Again
              </a>
              <a href="/login" className="btn btn-ghost" style={{ width: '100%' }}>
                Back to Sign In
              </a>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .confirm-page {
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg);
          padding: var(--space-lg);
        }

        .confirm-card {
          width: 100%;
          max-width: 380px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl, 20px);
          padding: var(--space-2xl) var(--space-xl);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-xl);
          box-shadow: var(--shadow-card);
        }

        .confirm-logo {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .confirm-logo__text {
          font-size: 28px;
          font-weight: 900;
          letter-spacing: -0.04em;
          color: var(--text-primary);
        }

        .confirm-body {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-md);
          text-align: center;
          width: 100%;
        }

        .confirm-spinner {
          width: 44px;
          height: 44px;
          border: 3px solid var(--border);
          border-top-color: var(--text-primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .confirm-icon {
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          animation: popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes popIn {
          from { transform: scale(0); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }

        .confirm-title {
          font-size: 22px;
          font-weight: 900;
          letter-spacing: -0.03em;
          color: var(--text-primary);
        }

        .confirm-sub {
          font-size: 14px;
          color: var(--text-tertiary);
          line-height: 1.5;
        }

        .confirm-actions {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
          width: 100%;
          margin-top: var(--space-sm);
        }
      `}</style>
    </div>
  )
}