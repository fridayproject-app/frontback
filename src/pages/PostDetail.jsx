import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { supabase } from '../lib/supabase'
import { DEMO_POSTS } from '../data/demoData'
import { useAuth } from '../context/AuthContext'
import VibeButton from '../components/ui/VibeButton'
import CommentsSection from '../components/comments/CommentsSection'

function VerifiedBadge() {
  return (
    <span className="verified-badge" title="Verified">
      <svg viewBox="0 0 10 10" fill="none">
        <path d="M2 5L4.2 7.5L8.5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </span>
  )
}

export default function PostDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(false)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    loadPost()
  }, [id])

  async function loadPost() {
    setLoading(true)
    // Check demo first
    const demoPost = DEMO_POSTS.find(p => p.id === id)
    if (demoPost) {
      setPost(demoPost)
      setIsDemo(true)
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profile:profiles(id, display_name, username, avatar_url, is_verified),
          reactions(count),
          comments(count)
        `)
        .eq('id', id)
        .single()

      if (error || !data) throw new Error('Not found')

      // Check if user has reacted
      let userReacted = false
      if (user) {
        const { data: rxn } = await supabase
          .from('reactions')
          .select('id')
          .eq('post_id', id)
          .eq('user_id', user.id)
          .single()
        userReacted = !!rxn
      }

      setPost({
        ...data,
        reaction_count: data.reactions?.[0]?.count || 0,
        comment_count: data.comments?.[0]?.count || 0,
        user_reacted: userReacted,
      })
      setIsDemo(false)
    } catch {
      setPost(null)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (d) => {
    try { return format(parseISO(d), 'EEEE, MMMM d, yyyy') } catch { return d }
  }
  const formatTime = (t) => {
    if (!t) return ''
    try {
      const [h, m] = t.split(':')
      const d = new Date(); d.setHours(+h, +m)
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch { return t }
  }

  const handleWhatsApp = () => {
    const num = (post.whatsapp_number || '').replace(/\D/g, '')
    window.open(`https://wa.me/${num}?text=Hi! I saw your event "${post.title}" on Friday app.`, '_blank')
  }

  if (loading) {
    return (
      <div className="page">
        <div className="post-detail-skeleton">
          <div className="skeleton" style={{ width: '100%', aspectRatio: '16/9' }} />
          <div style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div className="skeleton" style={{ width: '80%', height: 28 }} />
            <div className="skeleton" style={{ width: '100%', height: 14 }} />
            <div className="skeleton" style={{ width: '70%', height: 14 }} />
            <div className="skeleton" style={{ width: '50%', height: 14 }} />
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="page">
        <div className="empty-state" style={{ minHeight: '60vh' }}>
          <span className="empty-state__icon">🔍</span>
          <p className="empty-state__title">Event not found</p>
          <Link to="/" className="btn btn-ghost" style={{ marginTop: 'var(--space-md)' }}>
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const { profile } = post

  return (
    <div className="page post-detail-page">
      {/* Hero Image */}
      <div className="post-detail__hero">
        {!imgError && post.image_url ? (
          <img
            src={post.image_url}
            alt={post.title}
            className="post-detail__hero-img"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="post-detail__hero-fallback">
            <span>📅</span>
          </div>
        )}
        <div className="post-detail__hero-overlay" />
        {post.is_featured && (
          <span className="post-card__featured" style={{ top: 'var(--space-md)', right: 'var(--space-md)' }}>
            Featured
          </span>
        )}
        <span className="post-card__category" style={{ bottom: 'var(--space-md)', left: 'var(--space-md)' }}>
          {post.category}
        </span>
      </div>

      <div className="post-detail__body container">
        {/* Host */}
        <Link
          to={`/profile/${profile?.username || profile?.user_id}`}
          className="post-detail__host"
        >
          <img
            src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.display_name || 'U')}&background=222&color=fff&size=64`}
            alt={profile?.display_name}
            className="avatar"
            style={{ width: 36, height: 36 }}
            onError={e => { e.target.src = `https://ui-avatars.com/api/?name=U&background=222&color=fff` }}
          />
          <div>
            <div className="post-detail__host-name-row">
              <span className="post-detail__host-name">{profile?.display_name || 'Unknown Host'}</span>
              {profile?.is_verified && <VerifiedBadge />}
            </div>
            <span className="post-detail__host-username">@{profile?.username || 'unknown'}</span>
          </div>
        </Link>

        {/* Title */}
        <h1 className="post-detail__title">{post.title}</h1>

        {/* Description */}
        {post.description && (
          <p className="post-detail__desc">{post.description}</p>
        )}

        {/* Info grid */}
        <div className="post-detail__info-grid">
          {post.event_date && (
            <div className="post-detail__info-item">
              <div className="post-detail__info-icon">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect x="1.5" y="3" width="15" height="13.5" rx="2.5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M5.25 1.5v3M12.75 1.5v3M1.5 7.5h15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <span className="post-detail__info-label">Date & Time</span>
                <span className="post-detail__info-value">
                  {formatDate(post.event_date)}
                  {post.event_time && ` · ${formatTime(post.event_time)}`}
                </span>
              </div>
            </div>
          )}

          {(post.location_name || post.area) && (
            <div className="post-detail__info-item">
              <div className="post-detail__info-icon">
                <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
                  <path d="M8 1C4.686 1 2 3.686 2 7c0 4.5 6 11 6 11s6-6.5 6-11c0-3.314-2.686-6-6-6z" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="8" cy="7" r="2" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </div>
              <div>
                <span className="post-detail__info-label">Location</span>
                <span className="post-detail__info-value">
                  {post.location_name}{post.area ? `, ${post.area}` : ''}
                </span>
              </div>
            </div>
          )}

          {post.price_text && (
            <div className="post-detail__info-item">
              <div className="post-detail__info-icon">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M9 5.5v1M9 11.5v1M6.5 8.5c0-1.105.895-2 2-2h1a1.5 1.5 0 010 3h-1a1.5 1.5 0 000 3h1c1.105 0 2-.895 2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <span className="post-detail__info-label">Entry / Price</span>
                <span className="post-detail__info-value" style={{ color: post.price_text.toLowerCase().includes('free') ? '#34c759' : 'var(--text-primary)' }}>
                  {post.price_text}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="post-detail__actions">
          <VibeButton
            postId={post.id}
            initialCount={post.reaction_count || 0}
            initialVibed={post.user_reacted || false}
            isDemo={isDemo}
          />
          <a href="#comments" className="post-card__action-btn">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M13 9.5C13 10.0523 12.5523 10.5 12 10.5H4L1 13.5V2.5C1 1.94772 1.44772 1.5 2 1.5H12C12.5523 1.5 13 1.94772 13 2.5V9.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
            </svg>
            <span>{post.comment_count || 0} Comments</span>
          </a>
          {post.whatsapp_number && (
            <button className="post-card__action-btn post-card__action-btn--whatsapp" onClick={handleWhatsApp}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M7.5 1C3.91 1 1 3.91 1 7.5C1 8.72 1.34 9.86 1.93 10.83L1 14L4.27 13.1C5.21 13.64 6.32 13.97 7.5 13.97C11.09 13.97 14 11.06 14 7.47C14 3.91 11.09 1 7.5 1Z" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M5.5 6C5.5 6 5.5 8.5 8 9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <span>WhatsApp Host</span>
            </button>
          )}
          {post.contact_phone && (
            <a href={`tel:${post.contact_phone}`} className="post-card__action-btn">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 1h3l1.5 3.5L5 6s1 2 3 3l1.5-1.5L13 9v3c-7 1-12-5-11-11Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
              </svg>
              <span>Call</span>
            </a>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="divider" style={{ margin: 0 }} />

      {/* Comments */}
      <CommentsSection postId={post.id} isDemo={isDemo} />

      <style>{`
        .post-detail-page {
          padding-top: var(--header-h) !important;
          padding-bottom: calc(var(--bottom-nav-h) + var(--safe-bottom) + var(--space-xl));
        }

        .post-detail__hero {
          position: relative;
          width: 100%;
          aspect-ratio: 4/3;
          max-height: 360px;
          overflow: hidden;
          background: var(--bg-elevated);
        }

        .post-detail__hero-img {
          width: 100%; height: 100%;
          object-fit: cover;
        }

        .post-detail__hero-fallback {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          font-size: 64px; opacity: 0.3;
        }

        .post-detail__hero-overlay {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 50%;
          background: linear-gradient(to top, rgba(0,0,0,0.5), transparent);
        }

        .post-detail__body {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
          padding-top: var(--space-lg);
          padding-bottom: var(--space-lg);
        }

        .post-detail__host {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          text-decoration: none;
        }

        .post-detail__host-name-row {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .post-detail__host-name {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .post-detail__host-username {
          font-size: 12px;
          color: var(--text-tertiary);
          display: block;
        }

        .post-detail__title {
          font-size: clamp(22px, 6vw, 30px);
          font-weight: 900;
          letter-spacing: -0.04em;
          line-height: 1.15;
        }

        .post-detail__desc {
          font-size: 15px;
          color: var(--text-secondary);
          line-height: 1.65;
        }

        .post-detail__info-grid {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
          padding: var(--space-md);
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
        }

        .post-detail__info-item {
          display: flex;
          align-items: flex-start;
          gap: var(--space-md);
        }

        .post-detail__info-icon {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--accent-muted);
          border-radius: var(--radius-sm);
          flex-shrink: 0;
          color: var(--text-secondary);
        }

        .post-detail__info-label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 2px;
        }

        .post-detail__info-value {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .post-detail__actions {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-sm);
        }
      `}</style>
    </div>
  )
}
