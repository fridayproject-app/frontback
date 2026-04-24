import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { DEMO_POSTS, FILTER_CHIPS } from '../data/demoData'
import { isToday, isWeekend, parseISO } from 'date-fns'
import PostFeed from '../components/posts/PostFeed'
import FilterChips from '../components/ui/FilterChips'

export default function Home() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(false)
  const [filter, setFilter] = useState(null)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  useEffect(() => {
    fetchPosts()
  }, [])

  async function fetchPosts() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profile:profiles(id, display_name, username, avatar_url, is_verified),
          reactions(count),
          comments(count)
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error || !data || data.length === 0) {
        setIsDemo(true)
        setPosts(DEMO_POSTS)
      } else {
        setIsDemo(false)
        const enriched = data.map(p => ({
          ...p,
          reaction_count: p.reactions?.[0]?.count || 0,
          comment_count: p.comments?.[0]?.count || 0,
          user_reacted: false,
        }))
        setPosts(enriched)
      }
    } catch {
      setIsDemo(true)
      setPosts(DEMO_POSTS)
    } finally {
      setLoading(false)
    }
  }

  const filteredPosts = useCallback(() => {
    let result = [...posts]

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(p =>
        p.title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.location_name?.toLowerCase().includes(q) ||
        p.area?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      )
    }

    if (filter) {
      if (filter === 'tonight') {
        result = result.filter(p => {
          try { return p.event_date && isToday(parseISO(p.event_date)) } catch { return false }
        })
      } else if (filter === 'weekend') {
        result = result.filter(p => {
          try { return p.event_date && isWeekend(parseISO(p.event_date)) } catch { return false }
        })
      } else if (filter === 'free') {
        result = result.filter(p =>
          p.price_text?.toLowerCase().includes('free')
        )
      } else {
        result = result.filter(p => p.category === filter)
      }
    }

    return result
  }, [posts, filter, search])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput)
  }

  return (
    <div className="page">
      <div className="home">
        {/* Hero */}
        <div className="home__hero">
          <div className="container">
            <p className="home__city">Gaborone 🇧🇼</p>
            <h1 className="home__headline">What's happening<br />tonight?</h1>
          </div>
        </div>

        {/* Search */}
        <div className="home__search-wrap container">
          <form className="home__search" onSubmit={handleSearch}>
            <svg className="home__search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M13 13L10.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              className="home__search-input"
              type="search"
              placeholder="Search events, venues, areas…"
              value={searchInput}
              onChange={e => {
                setSearchInput(e.target.value)
                if (!e.target.value) setSearch('')
              }}
              onKeyDown={e => e.key === 'Enter' && handleSearch(e)}
            />
            {searchInput && (
              <button
                type="button"
                className="home__search-clear"
                onClick={() => { setSearchInput(''); setSearch('') }}
              >
                ✕
              </button>
            )}
          </form>
        </div>

        {/* Filter Chips */}
        <FilterChips active={filter} onChange={setFilter} />

        {/* Demo banner */}
        {isDemo && !loading && (
          <div className="container">
            <div className="home__demo-banner">
              <span>🌟</span>
              <span>Showing demo events · <strong>Sign up</strong> to post real events</span>
            </div>
          </div>
        )}

        {/* Feed */}
        <PostFeed posts={filteredPosts()} loading={loading} isDemo={isDemo} />
      </div>

      <style>{`
        .home__hero {
          padding: var(--space-lg) 0 var(--space-md);
        }

        .home__city {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-tertiary);
          letter-spacing: 0.02em;
          text-transform: uppercase;
          margin-bottom: var(--space-xs);
        }

        .home__headline {
          font-size: clamp(28px, 8vw, 40px);
          font-weight: 900;
          letter-spacing: -0.04em;
          line-height: 1.1;
          color: var(--text-primary);
        }

        .home__search-wrap {
          margin-bottom: var(--space-sm);
        }

        .home__search {
          position: relative;
          display: flex;
          align-items: center;
        }

        .home__search-icon {
          position: absolute;
          left: 14px;
          color: var(--text-tertiary);
          pointer-events: none;
          flex-shrink: 0;
        }

        .home__search-input {
          width: 100%;
          padding: 13px 40px 13px 40px;
          background: var(--bg-input);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-full);
          color: var(--text-primary);
          font-size: 15px;
          font-family: var(--font);
          transition: border-color var(--transition);
          -webkit-appearance: none;
        }

        .home__search-input:focus {
          border-color: var(--border-strong);
          outline: none;
        }

        .home__search-input::placeholder {
          color: var(--text-tertiary);
        }

        .home__search-clear {
          position: absolute;
          right: 14px;
          color: var(--text-tertiary);
          font-size: 12px;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: var(--bg-elevated);
          transition: all var(--transition);
        }

        .home__search-clear:hover {
          background: var(--accent-hover);
          color: var(--text-primary);
        }

        .home__demo-banner {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: 10px 14px;
          background: var(--accent-muted);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: var(--space-sm);
        }

        .home__demo-banner strong { color: var(--text-primary); }
      `}</style>
    </div>
  )
}
