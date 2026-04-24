import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { CATEGORIES, AREAS } from '../data/demoData'

export default function Create() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: '', description: '', image_url: '', category: '',
    location_name: '', area: '', event_date: '', event_time: '',
    price_text: '', contact_phone: '', whatsapp_number: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(false)

  if (!user) {
    return (
      <div className="page">
        <div className="empty-state" style={{ minHeight: '70vh' }}>
          <span className="empty-state__icon">🔒</span>
          <p className="empty-state__title">Sign in to post</p>
          <p className="empty-state__desc">You need an account to share events on Friday.</p>
          <a href="/login" className="btn btn-primary" style={{ marginTop: 'var(--space-md)' }}>
            Sign In
          </a>
        </div>
      </div>
    )
  }

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) return setError('Title is required.')
    if (!form.category) return setError('Please select a category.')

    setLoading(true)
    setError('')

    try {
      const { data, error: insertError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          ...form,
        })
        .select()
        .single()

      if (insertError) throw insertError
      navigate(`/post/${data.id}`)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="create-page container">
        <div className="create-header">
          <h2 className="create-header__title">New Event</h2>
          <p className="create-header__sub">Share what's happening in Gaborone</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="create-form" onSubmit={handleSubmit}>
          {/* Image URL */}
          <div className="form-group">
            <label className="form-label">Event Image URL</label>
            <input
              type="url"
              className="form-input"
              value={form.image_url}
              onChange={set('image_url')}
              placeholder="https://images.unsplash.com/…"
            />
            <span className="form-hint">Paste an image URL. Direct upload coming soon.</span>
            {form.image_url && (
              <div className="create-image-preview">
                <img
                  src={form.image_url}
                  alt="Preview"
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              </div>
            )}
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label">Event Title *</label>
            <input
              type="text"
              className="form-input"
              value={form.title}
              onChange={set('title')}
              placeholder="What's the event called?"
              required
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              value={form.description}
              onChange={set('description')}
              placeholder="Tell people what to expect…"
              rows={4}
              maxLength={1000}
            />
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label">Category *</label>
            <div className="create-category-grid">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  className={`create-category-btn ${form.category === cat.value ? 'create-category-btn--active' : ''}`}
                  onClick={() => setForm(f => ({ ...f, category: cat.value }))}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time */}
          <div className="create-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-input"
                value={form.event_date}
                onChange={set('event_date')}
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Time</label>
              <input
                type="time"
                className="form-input"
                value={form.event_time}
                onChange={set('event_time')}
              />
            </div>
          </div>

          {/* Location */}
          <div className="form-group">
            <label className="form-label">Venue / Location Name</label>
            <input
              type="text"
              className="form-input"
              value={form.location_name}
              onChange={set('location_name')}
              placeholder="e.g. Eclipse Club, Main Mall"
            />
          </div>

          {/* Area */}
          <div className="form-group">
            <label className="form-label">Area</label>
            <select
              className="form-input"
              value={form.area}
              onChange={set('area')}
              style={{ cursor: 'pointer' }}
            >
              <option value="">Select area…</option>
              {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          {/* Price */}
          <div className="form-group">
            <label className="form-label">Price / Entry</label>
            <input
              type="text"
              className="form-input"
              value={form.price_text}
              onChange={set('price_text')}
              placeholder="e.g. Free, P50, P100 per couple"
            />
          </div>

          {/* Contact */}
          <div className="create-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Contact Phone</label>
              <input
                type="tel"
                className="form-input"
                value={form.contact_phone}
                onChange={set('contact_phone')}
                placeholder="+267 7X XXX XXX"
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">WhatsApp</label>
              <input
                type="tel"
                className="form-input"
                value={form.whatsapp_number}
                onChange={set('whatsapp_number')}
                placeholder="+267 7X XXX XXX"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 'var(--space-sm)', padding: '15px' }}
            disabled={loading}
          >
            {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : 'Post Event'}
          </button>
        </form>
      </div>

      <style>{`
        .create-page {
          padding-top: var(--space-lg);
          padding-bottom: var(--space-2xl);
        }

        .create-header {
          margin-bottom: var(--space-xl);
        }

        .create-header__title {
          font-size: 28px;
          font-weight: 900;
          letter-spacing: -0.04em;
        }

        .create-header__sub {
          font-size: 14px;
          color: var(--text-tertiary);
          margin-top: 4px;
        }

        .create-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .form-hint {
          font-size: 12px;
          color: var(--text-tertiary);
          margin-top: 2px;
        }

        .create-image-preview {
          margin-top: var(--space-sm);
          border-radius: var(--radius-md);
          overflow: hidden;
          aspect-ratio: 16/9;
          background: var(--bg-elevated);
        }

        .create-image-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .create-category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: var(--space-sm);
        }

        .create-category-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 12px 8px;
          border-radius: var(--radius-md);
          background: var(--bg-input);
          border: 1.5px solid var(--border);
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 600;
          font-family: var(--font);
          transition: all var(--transition);
          cursor: pointer;
        }

        .create-category-btn:hover {
          border-color: var(--border-strong);
          color: var(--text-primary);
        }

        .create-category-btn--active {
          background: var(--accent);
          border-color: var(--accent);
          color: var(--accent-text);
        }

        .create-category-btn span:first-child { font-size: 20px; }

        .create-row {
          display: flex;
          gap: var(--space-md);
        }

        select.form-input option {
          background: var(--bg-card);
          color: var(--text-primary);
        }

        .auth-error {
          padding: 12px;
          background: rgba(255,59,48,0.1);
          border: 1px solid rgba(255,59,48,0.2);
          border-radius: var(--radius-sm);
          font-size: 13px;
          color: #ff3b30;
          font-weight: 500;
        }
      `}</style>
    </div>
  )
}
