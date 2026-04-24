import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

function CommentItem({ comment, onReply }) {
  const timeAgo = comment.created_at
    ? formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })
    : ''

  return (
    <div className={`comment ${comment.parent_comment_id ? 'comment--reply' : ''}`}>
      <img
        src={comment.profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.profile?.display_name || 'U')}&background=222&color=fff&size=64`}
        alt={comment.profile?.display_name}
        className="avatar comment__avatar"
        style={{ width: 30, height: 30 }}
        onError={e => { e.target.src = 'https://ui-avatars.com/api/?name=U&background=222&color=fff' }}
      />
      <div className="comment__body">
        <div className="comment__header">
          <Link to={`/profile/${comment.profile?.username}`} className="comment__name">
            {comment.profile?.display_name || 'Anonymous'}
          </Link>
          <span className="comment__time">{timeAgo}</span>
        </div>
        <p className="comment__text">{comment.content}</p>
        <button className="comment__reply-btn" onClick={() => onReply(comment)}>
          Reply
        </button>
      </div>
      <style>{`
        .comment {
          display: flex;
          gap: var(--space-sm);
          animation: fadeIn 0.2s ease;
        }
        .comment--reply {
          margin-left: 38px;
          padding-left: var(--space-sm);
          border-left: 2px solid var(--border);
        }
        .comment__body {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .comment__header {
          display: flex;
          align-items: baseline;
          gap: var(--space-sm);
        }
        .comment__name {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-primary);
          text-decoration: none;
        }
        .comment__name:hover { text-decoration: underline; }
        .comment__time {
          font-size: 11px;
          color: var(--text-tertiary);
        }
        .comment__text {
          font-size: 14px;
          color: var(--text-primary);
          line-height: 1.5;
        }
        .comment__reply-btn {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-tertiary);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          transition: color var(--transition);
          align-self: flex-start;
        }
        .comment__reply-btn:hover { color: var(--text-secondary); }
      `}</style>
    </div>
  )
}

export default function CommentsSection({ postId, isDemo = false }) {
  const { user, profile } = useAuth()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isDemo) fetchComments()
    else setLoading(false)
  }, [postId, isDemo])

  async function fetchComments() {
    setLoading(true)
    const { data } = await supabase
      .from('comments')
      .select('*, profile:profiles(display_name, username, avatar_url)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
    if (data) setComments(data)
    setLoading(false)
  }

  async function handleSubmit() {
    if (!text.trim() || !user) return
    setSubmitting(true)
    const { data, error } = await supabase.from('comments').insert({
      post_id: postId,
      user_id: user.id,
      content: text.trim(),
      parent_comment_id: replyTo?.id || null,
    }).select('*, profile:profiles(display_name, username, avatar_url)').single()

    if (!error && data) {
      setComments(prev => [...prev, data])
      setText('')
      setReplyTo(null)
    }
    setSubmitting(false)
  }

  const rootComments = comments.filter(c => !c.parent_comment_id)
  const getReplies = (id) => comments.filter(c => c.parent_comment_id === id)

  return (
    <div className="comments-section" id="comments">
      <h3 className="comments-section__title">Comments {comments.length > 0 && `(${comments.length})`}</h3>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
          <div className="spinner" />
        </div>
      ) : (
        <div className="comments-list">
          {rootComments.length === 0 && !isDemo && (
            <p className="comments-empty">No comments yet. Be the first!</p>
          )}
          {isDemo && (
            <>
              <CommentItem comment={{
                id: 'd1', content: 'This looks fire 🔥 already got my tickets!',
                created_at: new Date(Date.now() - 3600000).toISOString(),
                profile: { display_name: 'Lebo M.', username: 'lebom', avatar_url: null }
              }} onReply={() => {}} />
              <CommentItem comment={{
                id: 'd2', content: 'Every time they do this event it slaps. See you there 💯',
                created_at: new Date(Date.now() - 7200000).toISOString(),
                profile: { display_name: 'Tshepo', username: 'tshepo_bw', avatar_url: null }
              }} onReply={() => {}} />
              <CommentItem comment={{
                id: 'd3', content: 'Dress code?',
                created_at: new Date(Date.now() - 1800000).toISOString(),
                parent_comment_id: 'd1',
                profile: { display_name: 'Neo K.', username: 'neok', avatar_url: null }
              }} onReply={() => {}} />
            </>
          )}
          {rootComments.map(comment => (
            <div key={comment.id}>
              <CommentItem comment={comment} onReply={setReplyTo} />
              {getReplies(comment.id).map(reply => (
                <CommentItem key={reply.id} comment={reply} onReply={setReplyTo} />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      {user ? (
        <div className="comments-input-area">
          {replyTo && (
            <div className="comments-reply-indicator">
              <span>Replying to {replyTo.profile?.display_name || 'comment'}</span>
              <button onClick={() => setReplyTo(null)}>✕</button>
            </div>
          )}
          <div className="comments-input-row">
            <img
              src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.display_name || 'U')}&background=222&color=fff&size=64`}
              alt=""
              className="avatar"
              style={{ width: 30, height: 30, flexShrink: 0 }}
            />
            <input
              className="form-input comments-input"
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder={replyTo ? `Reply to ${replyTo.profile?.display_name}...` : 'Add a comment…'}
              maxLength={500}
            />
            <button
              className="btn btn-primary comments-send-btn"
              onClick={handleSubmit}
              disabled={!text.trim() || submitting}
              style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)' }}
            >
              {submitting ? <span className="spinner" style={{ width: 16, height: 16 }} /> : (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="comments-login-prompt">
          <Link to="/login" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
            Sign in to comment
          </Link>
        </div>
      )}

      <style>{`
        .comments-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
          padding: var(--space-md);
          border-top: 1px solid var(--border);
        }
        .comments-section__title {
          font-size: 16px;
          font-weight: 800;
          letter-spacing: -0.02em;
        }
        .comments-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }
        .comments-empty {
          font-size: 14px;
          color: var(--text-tertiary);
          text-align: center;
          padding: var(--space-lg) 0;
        }
        .comments-input-area {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }
        .comments-reply-indicator {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 10px;
          background: var(--accent-muted);
          border-radius: var(--radius-sm);
          font-size: 12px;
          color: var(--text-secondary);
          font-weight: 500;
        }
        .comments-reply-indicator button {
          color: var(--text-tertiary);
          font-size: 12px;
        }
        .comments-input-row {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }
        .comments-input {
          flex: 1;
          padding: 10px 14px;
          font-size: 14px;
        }
        .comments-send-btn:disabled { opacity: 0.4; }
        .comments-login-prompt { padding: var(--space-sm) 0; }
      `}</style>
    </div>
  )
}
