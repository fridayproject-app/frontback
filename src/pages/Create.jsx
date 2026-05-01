import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { AREAS } from '../data/demoData'

/* ── Category icons (SVG, no emojis) ─────────────────────────────── */
const CATEGORIES = [
  {
    value: 'parties',
    label: 'Parties',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 2v4M6 4l2 3M16 4l-2 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        <path d="M4 14c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        <path d="M2 14h18M7 14v5m4-5v5m4-5v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    value: 'nightlife',
    label: 'Nightlife',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M17 10.5A7 7 0 019 3a7 7 0 100 14 7 7 0 008-6.5z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    value: 'restaurants',
    label: 'Food & Drink',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M8 3v6a4 4 0 004 4v6M16 3v16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        <path d="M4 3v4c0 2.21 1.79 4 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    value: 'campus',
    label: 'Campus',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 2L2 7l9 5 9-5-9-5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
        <path d="M2 7v8M20 7v8M6 9.5v5.5a5 5 0 0010 0V9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    value: 'sports',
    label: 'Sports',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="8.5" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M11 2.5c0 3-2 5.5-2 8.5s2 5.5 2 8.5M2.5 11c3 0 5.5-2 8.5-2s5.5 2 8.5 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    value: 'music',
    label: 'Music',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M9 17V5l11-2v12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="6" cy="17" r="2.5" stroke="currentColor" strokeWidth="1.6"/>
        <circle cx="17" cy="15" r="2.5" stroke="currentColor" strokeWidth="1.6"/>
      </svg>
    ),
  },
  {
    value: 'arts',
    label: 'Arts',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="8.5" stroke="currentColor" strokeWidth="1.6"/>
        <circle cx="8" cy="9" r="1.5" fill="currentColor"/>
        <circle cx="14" cy="9" r="1.5" fill="currentColor"/>
        <circle cx="11" cy="14" r="1.5" fill="currentColor"/>
      </svg>
    ),
  },
  {
    value: 'free',
    label: 'Free Entry',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="8.5" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M11 6.5v1M11 14.5v1M8.5 9.5c0-1.105.895-2 2-2h1.5a1.5 1.5 0 010 3h-2a1.5 1.5 0 000 3H12c1.105 0 2-.895 2-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
]

/* ── Upload helper ────────────────────────────────────────────────── */
async function uploadImage(file, userId) {
  const ext = file.name.split('.').pop()
  const path = `${userId}/${Date.now()}.${ext}`
  const { data, error } = await supabase.storage
    .from('post-images')
    .upload(path, file, { upsert: false })
  if (error) throw error
  const { data: { publicUrl } } = supabase.storage
    .from('post-images')
    .getPublicUrl(data.path)
  return publicUrl
}

/* ── Component ────────────────────────────────────────────────────── */
export default function Create() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    title: '', description: '', image_url: '', category: '',
    location_name: '', area: '', event_date: '', event_time: '',
    price_text: '', contact_phone: '', whatsapp_number: '',
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!user) {
    return (
      <div className="page">
        <div className="empty-state" style={{ minHeight: '70vh' }}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ opacity: 0.3, marginBottom: 12 }}>
            <rect x="4" y="14" width="32" height="22" rx="4" stroke="currentColor" strokeWidth="2"/>
            <path d="M13 14V10a7 7 0 0114 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
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

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10 MB.')
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setError('')
  }

  function removeImage() {
    setImageFile(null)
    setImagePreview(null)
    setForm(f => ({ ...f, image_url: '' }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) return setError('Title is required.')
    if (!form.category) return setError('Please select a category.')

    setLoading(true)
    setError('')

    try {
      let image_url = form.image_url

      // Upload image if one was selected
      if (imageFile) {
        setUploading(true)
        image_url = await uploadImage(imageFile, user.id)
        setUploading(false)
      }

      const { data, error: insertError } = await supabase
        .from('posts')
        .insert({ user_id: user.id, ...form, image_url })
        .select()
        .single()

      if (insertError) throw insertError
      navigate(`/post/${data.id}`)
    } catch (err) {
      setUploading(false)
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="create-page container">
        <div className="create-header">
          <h2 className="create-header__title">New Post</h2>
          <p className="create-header__sub">Share what's happening in Gaborone</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="create-form" onSubmit={handleSubmit}>

          {/* ── Image Upload ─────────────────────────────────────────── */}
          <div className="form-group">
            <label className="form-label">Photo</label>

            {imagePreview ? (
              <div className="create-image-preview">
                <img src={imagePreview} alt="Preview" />
                <button
                  type="button"
                  className="create-image-remove"
                  onClick={removeImage}
                  aria-label="Remove photo"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="create-upload-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M14 6v12M8 12l6-6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 20h20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                <span className="create-upload-btn__label">Tap to upload a photo</span>
                <span className="create-upload-btn__hint">JPG, PNG or WebP · Max 10 MB</span>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>

          {/* ── Title ────────────────────────────────────────────────── */}
          <div className="form-group">
            <label className="form-label">Title *</label>
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

          {/* ── Description ──────────────────────────────────────────── */}
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

          {/* ── Category ─────────────────────────────────────────────── */}
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
                  <span className="create-category-btn__icon">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Date & Time ──────────────────────────────────────────── */}
          <div className="create-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Date</label>
              <input type="date" className="form-input" value={form.event_date} onChange={set('event_date')} />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Time</label>
              <input type="time" className="form-input" value={form.event_time} onChange={set('event_time')} />
            </div>
          </div>

          {/* ── Location ─────────────────────────────────────────────── */}
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

          {/* ── Area ─────────────────────────────────────────────────── */}
          <div className="form-group">
            <label className="form-label">Area</label>
            <select className="form-input" value={form.area} onChange={set('area')}>
              <option value="">Select area…</option>
              {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          {/* ── Price ────────────────────────────────────────────────── */}
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

          {/* ── Contact ──────────────────────────────────────────────── */}
          <div className="create-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Contact Phone</label>
              <input type="tel" className="form-input" value={form.contact_phone} onChange={set('contact_phone')} placeholder="+267 7X XXX XXX" />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">WhatsApp</label>
              <input type="tel" className="form-input" value={form.whatsapp_number} onChange={set('whatsapp_number')} placeholder="+267 7X XXX XXX" />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 'var(--space-sm)', padding: '15px' }}
            disabled={loading}
          >
            {loading
              ? <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                  <span className="spinner" style={{ width: 18, height: 18 }} />
                  {uploading ? 'Uploading photo…' : 'Posting…'}
                </span>
              : 'Post Event'
            }
          </button>
        </form>
      </div>

      <style>{`
        .create-page {
          padding-top: var(--space-lg);
          padding-bottom: var(--space-2xl);
        }

        .create-header { margin-bottom: var(--space-xl); }

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

        /* Upload button */
        .create-upload-btn {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 36px 20px;
          border: 2px dashed var(--border);
          border-radius: var(--radius-lg);
          background: var(--bg-input);
          color: var(--text-tertiary);
          cursor: pointer;
          transition: all var(--transition);
          font-family: var(--font);
        }

        .create-upload-btn:hover {
          border-color: var(--border-strong);
          color: var(--text-primary);
          background: var(--accent-muted);
        }

        .create-upload-btn__label {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .create-upload-btn__hint {
          font-size: 12px;
          color: var(--text-tertiary);
        }

        /* Image preview */
        .create-image-preview {
          position: relative;
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

        .create-image-remove {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(0,0,0,0.55);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background var(--transition);
          backdrop-filter: blur(6px);
          border: none;
        }

        .create-image-remove:hover { background: rgba(0,0,0,0.8); }

        /* Category grid */
        .create-category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
          gap: var(--space-sm);
        }

        .create-category-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 14px 8px 12px;
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

        .create-category-btn__icon {
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.85;
        }

        .create-category-btn--active .create-category-btn__icon { opacity: 1; }

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
