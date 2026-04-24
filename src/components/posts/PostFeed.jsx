import PostCard from './PostCard'

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton" style={{ aspectRatio: '16/9', width: '100%', borderRadius: 0 }} />
      <div className="skeleton-card__body">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="skeleton" style={{ width: 28, height: 28, borderRadius: '50%' }} />
          <div className="skeleton" style={{ width: 100, height: 12, borderRadius: 4 }} />
        </div>
        <div className="skeleton" style={{ width: '75%', height: 18, borderRadius: 4 }} />
        <div className="skeleton" style={{ width: '100%', height: 12, borderRadius: 4 }} />
        <div className="skeleton" style={{ width: '60%', height: 12, borderRadius: 4 }} />
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <div className="skeleton" style={{ width: 72, height: 32, borderRadius: 999 }} />
          <div className="skeleton" style={{ width: 52, height: 32, borderRadius: 999 }} />
          <div className="skeleton" style={{ width: 90, height: 32, borderRadius: 999 }} />
        </div>
      </div>
      <style>{`
        .skeleton-card {
          border-radius: var(--radius-lg);
          overflow: hidden;
          background: var(--bg-card);
          border: 1px solid var(--border);
        }
        .skeleton-card__body {
          padding: var(--space-md);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
      `}</style>
    </div>
  )
}

export default function PostFeed({ posts, loading, isDemo = false }) {
  if (loading) {
    return (
      <div className="post-feed">
        {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
      </div>
    )
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-state__icon">🌙</span>
        <p className="empty-state__title">No events found</p>
        <p className="empty-state__desc">Try a different filter or check back later.</p>
      </div>
    )
  }

  return (
    <div className="post-feed">
      {posts.map((post, i) => (
        <div key={post.id} style={{ animationDelay: `${i * 0.06}s` }}>
          <PostCard post={post} isDemo={isDemo} />
        </div>
      ))}
      <style>{`
        .post-feed {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
          padding: var(--space-md);
          padding-top: 0;
        }
      `}</style>
    </div>
  )
}
