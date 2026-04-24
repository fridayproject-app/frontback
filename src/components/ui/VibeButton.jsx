import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

function SparkIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M8 1L9.5 6H15L10.5 9.5L12 14L8 10.5L4 14L5.5 9.5L1 6H6.5L8 1Z"
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function VibeButton({ postId, initialCount = 0, initialVibed = false, isDemo = false }) {
  const { user } = useAuth()
  const [vibed, setVibed] = useState(initialVibed)
  const [count, setCount] = useState(initialCount)
  const [animating, setAnimating] = useState(false)

  async function handleVibe() {
    if (!user && !isDemo) {
      window.location.href = '/login'
      return
    }

    const newVibed = !vibed
    setVibed(newVibed)
    setCount(c => newVibed ? c + 1 : c - 1)
    setAnimating(true)
    setTimeout(() => setAnimating(false), 400)

    if (!isDemo) {
      if (newVibed) {
        await supabase.from('reactions').insert({
          post_id: postId,
          user_id: user.id,
          reaction_type: 'vibe',
        })
      } else {
        await supabase.from('reactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)
      }
    }
  }

  return (
    <button
      className={`vibe-btn ${vibed ? 'vibe-btn--active' : ''} ${animating ? 'vibe-btn--animating' : ''}`}
      onClick={handleVibe}
      aria-label={vibed ? 'Remove vibe' : 'Vibe this event'}
    >
      <SparkIcon active={vibed} />
      <span className="vibe-btn__label">Vibe</span>
      {count > 0 && <span className="vibe-btn__count">{count >= 1000 ? `${(count/1000).toFixed(1)}k` : count}</span>}

      <style>{`
        .vibe-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 8px 12px;
          border-radius: var(--radius-full);
          background: var(--accent-muted);
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: -0.01em;
          transition: all var(--transition);
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }

        .vibe-btn:hover {
          background: var(--accent-hover);
          color: var(--text-primary);
        }

        .vibe-btn:active {
          transform: scale(0.92);
        }

        .vibe-btn--active {
          background: var(--vibe-active-bg);
          color: var(--vibe-active);
        }

        .vibe-btn--animating svg {
          animation: vibeOut 0.4s var(--spring);
        }

        .vibe-btn__label { line-height: 1; }
        .vibe-btn__count {
          font-size: 12px;
          opacity: 0.7;
        }
      `}</style>
    </button>
  )
}
