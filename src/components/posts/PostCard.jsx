import { useState } from 'react'
import { Link } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import VibeButton from '../ui/VibeButton'

function VerifiedBadge() {
  return (
    <span className="verified-badge" title="Verified">
      <svg viewBox="0 0 10 10" fill="none">
        <path d="M2 5L4.2 7.5L8.5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </span>
  )
}

function CategoryPill({ category }) {
  const emojis = {
    Party: '🎉', Restaurant: '🍽️', Campus: '🎓',
    'Public Event': '🎪', Nightlife: '🌙', Chill: '🧘', Other: '✨'
  }
  return (
    <span className="post-card__category">
      {emojis[category] || '✨'} {category}
    </span>
  )
}

export default function PostCard({ post, isDemo = false }) {
  const { profile } = post
  const [imgError, setImgError] = useState(false)

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    try {
      return format(parseISO(dateStr), 'EEE, MMM d')
    } catch {
      return dateStr
    }
  }

  const formatTime = (timeStr) => {
    if (!timeStr) return ''
    try {
      const [h, m] = timeStr.split(':')
      const d = new Date()
      d.setHours(+h, +m)
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return timeStr
    }
  }

  const handleWhatsApp = (e) => {
    e.preventDefault()
    const num = (post.whatsapp_number || '').replace(/\D/g, '')
    window.open(`https://wa.me/${num}?text=Hi! I saw your event "${post.title}" on Friday app.`, '_blank')
  }

  const handleCall = (e) => {
    e.preventDefault()
    window.location.href = `tel:${post.contact_phone}`
  }

  return (
    <article className="post-card">
      {/* Image */}
      <Link to={`/post/${post.id}`} className="post-card__image-wrap">
        {!imgError && post.image_url ? (
          <img
            src={post.image_url}
            alt={post.title}
            className="post-card__image"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="post-card__image-fallback">
            <span>📅</span>
          </div>
        )}
        {post.is_featured && (
          <span className="post-card__featured">Featured</span>
        )}
        <CategoryPill category={post.category} />
      </Link>

      {/* Body */}
      <div className="post-card__body">
        {/* Host row */}
        <Link
          to={`/profile/${profile?.username || profile?.user_id}`}
          className="post-card__host"
        >
          <img
            src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.display_name || 'U')}&background=222&color=fff&size=64`}
            alt={profile?.display_name}
            className="avatar post-card__avatar"
            style={{ width: 28, height: 28 }}
            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=U&background=222&color=fff` }}
          />
          <div className="post-card__host-info">
            <span className="post-card__host-name">{profile?.display_name || 'Unknown Host'}</span>
            {profile?.is_verified && <VerifiedBadge />}
            <span className="post-card__host-username">@{profile?.username || 'unknown'}</span>
          </div>
        </Link>

        {/* Title */}
        <Link to={`/post/${post.id}`} className="post-card__title-link">
          <h3 className="post-card__title">{post.title}</h3>
        </Link>

        {/* Description */}
        {post.description && (
          <p className="post-card__desc">{post.description}</p>
        )}

        {/* Meta */}
        <div className="post-card__meta">
          {(post.event_date || post.event_time) && (
            <span className="post-card__meta-item">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <rect x="1" y="2" width="11" height="10" rx="2" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M4 1v2M9 1v2M1 5h11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              {formatDate(post.event_date)} {post.event_time && `· ${formatTime(post.event_time)}`}
            </span>
          )}
          {(post.location_name || post.area) && (
            <span className="post-card__meta-item">
              <svg width="11" height="13" viewBox="0 0 11 13" fill="none">
                <path d="M5.5 1C3.01 1 1 3.01 1 5.5C1 8.5 5.5 13 5.5 13C5.5 13 10 8.5 10 5.5C10 3.01 7.99 1 5.5 1Z" stroke="currentColor" strokeWidth="1.2"/>
                <circle cx="5.5" cy="5.5" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
              </svg>
              {post.location_name}{post.area ? `, ${post.area}` : ''}
            </span>
          )}
          {post.price_text && (
            <span className="post-card__meta-item post-card__price">
              {post.price_text.toLowerCase() === 'free' || post.price_text.toLowerCase() === 'free entry' ? (
                <span className="post-card__free">Free</span>
              ) : (
                post.price_text
              )}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="post-card__actions">
          <VibeButton
            postId={post.id}
            initialCount={post.reaction_count || 0}
            initialVibed={post.user_reacted || false}
            isDemo={isDemo}
          />

          <Link to={`/post/${post.id}#comments`} className="post-card__action-btn">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M13 9.5C13 10.0523 12.5523 10.5 12 10.5H4L1 13.5V2.5C1 1.94772 1.44772 1.5 2 1.5H12C12.5523 1.5 13 1.94772 13 2.5V9.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
            </svg>
            <span>{post.comment_count || 0}</span>
          </Link>

          {post.whatsapp_number && (
            <button className="post-card__action-btn post-card__action-btn--whatsapp" onClick={handleWhatsApp}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M7.5 1C3.91 1 1 3.91 1 7.5C1 8.72 1.34 9.86 1.93 10.83L1 14L4.27 13.1C5.21 13.64 6.32 13.97 7.5 13.97C11.09 13.97 14 11.06 14 7.47C14 3.91 11.09 1 7.5 1Z" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M5.5 6C5.5 6 5.5 8.5 8 9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <span>WhatsApp</span>
            </button>
          )}

          {post.contact_phone && (
            <button className="post-card__action-btn" onClick={handleCall}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 1h3l1.5 3.5L5 6s1 2 3 3l1.5-1.5L13 9v3c-7 1-12-5-11-11Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      <style>{`
        .post-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          transition: transform var(--transition), box-shadow var(--transition);
          animation: fadeIn 0.3s ease;
        }

        .post-card:hover {
          box-shadow: var(--shadow-card);
          transform: translateY(-1px);
        }

        .post-card__image-wrap {
          position: relative;
          display: block;
          aspect-ratio: 16/9;
          overflow: hidden;
          background: var(--bg-elevated);
          text-decoration: none;
        }

        .post-card__image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .post-card:hover .post-card__image {
          transform: scale(1.03);
        }

        .post-card__image-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
          opacity: 0.3;
        }

        .post-card__featured {
          position: absolute;
          top: var(--space-sm);
          right: var(--space-sm);
          padding: 4px 8px;
          background: var(--text-primary);
          color: var(--bg);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border-radius: var(--radius-full);
        }

        .post-card__category {
          position: absolute;
          bottom: var(--space-sm);
          left: var(--space-sm);
          padding: 4px 10px;
          background: rgba(0,0,0,0.65);
          backdrop-filter: blur(8px);
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          border-radius: var(--radius-full);
          letter-spacing: 0.01em;
        }

        .post-card__body {
          padding: var(--space-md);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .post-card__host {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          text-decoration: none;
          color: var(--text-secondary);
        }

        .post-card__host-info {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-wrap: wrap;
        }

        .post-card__host-name {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .post-card__host-username {
          font-size: 12px;
          color: var(--text-tertiary);
        }

        .post-card__title-link { text-decoration: none; }

        .post-card__title {
          font-size: 17px;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--text-primary);
          line-height: 1.25;
        }

        .post-card__desc {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.55;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .post-card__meta {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-sm);
        }

        .post-card__meta-item {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .post-card__meta-item svg { opacity: 0.6; flex-shrink: 0; }

        .post-card__price { font-weight: 700; color: var(--text-primary); }

        .post-card__free {
          color: #34c759;
          font-weight: 700;
        }

        .post-card__actions {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding-top: 2px;
          flex-wrap: wrap;
        }

        .post-card__action-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 8px 12px;
          border-radius: var(--radius-full);
          background: var(--accent-muted);
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 600;
          transition: all var(--transition);
          text-decoration: none;
          cursor: pointer;
          border: none;
          font-family: var(--font);
          -webkit-tap-highlight-color: transparent;
        }

        .post-card__action-btn:hover {
          background: var(--accent-hover);
          color: var(--text-primary);
        }

        .post-card__action-btn:active { transform: scale(0.92); }

        .post-card__action-btn--whatsapp:hover {
          background: rgba(37, 211, 102, 0.15);
          color: #25d366;
        }
      `}</style>
    </article>
  )
}
