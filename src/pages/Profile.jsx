import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import PostCard from '../components/posts/PostCard'

function VerifiedBadge() {
  return (
    <span className="verified-badge" title="Verified">
      <svg viewBox="0 0 10 10" fill="none">
        <path d="M2 5L4.2 7.5L8.5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </span>
  )
}

export default function Profile() {
  const { username } = useParams()
  const { user, profile: myProfile, signOut, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)

  const isOwn = !username || (myProfile && myProfile.username === username) || (user && !username)

  useEffect(() => {
    loadProfile()
  }, [username, myProfile])

  async function loadProfile() {
    setLoading(true)
    try {
      let profileData = null

      if (isOwn && myProfile) {
        profileData = myProfile
      } else if (username) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single()
        profileData = data
      } else if (user && myProfile) {
        profileData = myProfile
      }

      if (!profileData) {
        setLoading(false)
        return
      }

      setProfile(profileData)
      setEditForm({
        display_name: profileData.display_name || '',
        bio: profileData.bio || '',
        avatar_url: profileData.avatar_url || '',
        cover_url: profileData.cover_url || '',
        phone_number: profileData.phone_number || '',
        whatsapp_number: profileData.whatsapp_number || '',
      })

      // Load their posts
      const { data: postsData } = await supabase
        .from('posts')
        .select('*, profile:profiles(display_name, username, avatar_url, is_verified)')
        .eq('user_id', profileData.user_id)
        .order('created_at', { ascending: false })

      setPosts(postsData || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update(editForm)
      .eq('user_id', user.id)

    if (!error) {
      await refreshProfile()
      setEditing(false)
      loadProfile()
    }
    setSaving(false)
  }

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  if (!user && !username) {
    return (
      <div className="page">
        <div className="empty-state" style={{ minHeight: '70vh' }}>
          <span className="empty-state__icon">👤</span>
          <p className="empty-state__title">Sign in to view your profile</p>
          <Link to="/login" className="btn btn-primary" style={{ marginTop: 'var(--space-md)' }}>
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="page">
        <div className="profile-skeleton">
          <div className="skeleton" style={{ width: '100%', height: 180 }} />
          <div style={{ padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            <div className="skeleton" style={{ width: 72, height: 72, borderRadius: '50%' }} />
            <div className="skeleton" style={{ width: 140, height: 20 }} />
            <div className="skeleton" style={{ width: 100, height: 14 }} />
            <div className="skeleton" style={{ width: '80%', height: 14 }} />
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="page">
        <div className="empty-state" style={{ minHeight: '60vh' }}>
          <span className="empty-state__icon">🙁</span>
          <p className="empty-state__title">Profile not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page profile-page">
      {/* Cover */}
      <div className="profile-cover">
        {profile.cover_url ? (
          <img src={profile.cover_url} alt="Cover" className="profile-cover__img" />
        ) : (
          <div className="profile-cover__fallback" />
        )}
      </div>

      {/* Profile info */}
      <div className="profile-info container">
        <div className="profile-info__top">
          <div className="profile-avatar-wrap">
            <img
              src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.display_name || 'U')}&background=222&color=fff&size=128`}
              alt={profile.display_name}
              className="profile-avatar avatar"
              onError={e => { e.target.src = `https://ui-avatars.com/api/?name=U&background=222&color=fff&size=128` }}
            />
          </div>
          {isOwn && (
            <div className="profile-actions">
              <button
                className="btn btn-ghost"
                style={{ padding: '8px 16px', fontSize: 14 }}
                onClick={() => setEditing(!editing)}
              >
                {editing ? 'Cancel' : 'Edit Profile'}
              </button>
              <button
                className="btn btn-ghost"
                style={{ padding: '8px 16px', fontSize: 14 }}
                onClick={handleSignOut}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>

        <div className="profile-meta">
          <div className="profile-name-row">
            <h1 className="profile-name">{profile.display_name}</h1>
            {profile.is_verified && <VerifiedBadge />}
          </div>
          <p className="profile-username">@{profile.username}</p>
          {profile.bio && <p className="profile-bio">{profile.bio}</p>}

          <div className="profile-stats">
            <span className="profile-stat">
              <strong>{posts.length}</strong> Posts
            </span>
          </div>
        </div>
      </div>

      {/* Edit form */}
      {editing && isOwn && (
        <div className="profile-edit container">
          <h3 className="profile-edit__title">Edit Profile</h3>
          <div className="profile-edit__form">
            {[
              { label: 'Display Name', key: 'display_name', type: 'text' },
              { label: 'Avatar URL', key: 'avatar_url', type: 'url' },
              { label: 'Cover Image URL', key: 'cover_url', type: 'url' },
              { label: 'Phone Number', key: 'phone_number', type: 'tel' },
              { label: 'WhatsApp Number', key: 'whatsapp_number', type: 'tel' },
            ].map(({ label, key, type }) => (
              <div key={key} className="form-group">
                <label className="form-label">{label}</label>
                <input
                  type={type}
                  className="form-input"
                  value={editForm[key] || ''}
                  onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                />
              </div>
            ))}
            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea
                className="form-input"
                value={editForm.bio || ''}
                onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))}
                rows={3}
                maxLength={200}
              />
            </div>
            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <span className="spinner" style={{ width: 18, height: 18 }} /> : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      <div className="divider" style={{ margin: 'var(--space-lg) 0 var(--space-md)' }} />

      {/* Posts */}
      <div className="container">
        <h3 className="profile-posts-title">
          {isOwn ? 'Your Posts' : 'Posts'}
        </h3>
      </div>

      {posts.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__icon">📭</span>
          <p className="empty-state__title">No posts yet</p>
          {isOwn && (
            <Link to="/create" className="btn btn-primary" style={{ marginTop: 'var(--space-md)' }}>
              Post an Event
            </Link>
          )}
        </div>
      ) : (
        <div style={{ padding: '0 var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {posts.map(post => (
            <PostCard key={post.id} post={{ ...post, profile }} />
          ))}
        </div>
      )}

      <style>{`
        .profile-page { padding-top: var(--header-h) !important; }

        .profile-cover {
          width: 100%;
          aspect-ratio: 3/1;
          background: var(--bg-elevated);
          overflow: hidden;
          max-height: 200px;
        }

        .profile-cover__img {
          width: 100%; height: 100%;
          object-fit: cover;
        }

        .profile-cover__fallback {
          width: 100%; height: 100%;
          background: linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg-card) 100%);
        }

        .profile-info {
          padding-top: var(--space-md);
          padding-bottom: var(--space-md);
        }

        .profile-info__top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: var(--space-md);
        }

        .profile-avatar-wrap {
          margin-top: -52px;
        }

        .profile-avatar {
          width: 88px;
          height: 88px;
          border: 3px solid var(--bg);
          box-shadow: var(--shadow-card);
        }

        .profile-actions {
          display: flex;
          gap: var(--space-sm);
          flex-wrap: wrap;
          justify-content: flex-end;
          padding-top: var(--space-sm);
        }

        .profile-meta {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .profile-name-row {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }

        .profile-name {
          font-size: 22px;
          font-weight: 900;
          letter-spacing: -0.03em;
        }

        .profile-username {
          font-size: 14px;
          color: var(--text-tertiary);
          font-weight: 500;
        }

        .profile-bio {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.55;
          margin-top: 4px;
        }

        .profile-stats {
          display: flex;
          gap: var(--space-lg);
          margin-top: var(--space-sm);
        }

        .profile-stat {
          font-size: 14px;
          color: var(--text-secondary);
        }

        .profile-stat strong {
          color: var(--text-primary);
          font-weight: 800;
        }

        .profile-edit {
          margin-bottom: var(--space-lg);
        }

        .profile-edit__title {
          font-size: 18px;
          font-weight: 800;
          margin-bottom: var(--space-md);
          letter-spacing: -0.02em;
        }

        .profile-edit__form {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
          padding: var(--space-lg);
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
        }

        .profile-posts-title {
          font-size: 18px;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: var(--space-md);
        }
      `}</style>
    </div>
  )
}
