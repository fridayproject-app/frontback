import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { DEMO_POSTS, CATEGORIES, AREAS } from '../data/demoData'
import PostFeed from '../components/posts/PostFeed'

export default function Search() {
  const [query, setQuery] = useState('')
  const [selectedCat, setSelectedCat] = useState(null)
  const [selectedArea, setSelectedArea] = useState(null)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [isDemo, setIsDemo] = useState(false)
  const inputRef = useRef()

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    if (query || selectedCat || selectedArea) {
      doSearch()
    } else {
      setResults([])
      setSearched(false)
    }
  }, [query, selectedCat, selectedArea])

  async function doSearch() {
    setLoading(true)
    setSearched(true)
    try {
      let q = supabase
        .from('posts')
        .select('*, profile:profiles(display_name, username, avatar_url, is_verified)')
        .order('created_at', { ascending: false })

      if (query) {
        q = q.or(`title.ilike.%${query}%,description.ilike.%${query}%,location_name.ilike.%${query}%`)
      }
      if (selectedCat) q = q.eq('category', selectedCat)
      if (selectedArea) q = q.eq('area', selectedArea)

      const { data, error } = await q.limit(30)

      if (error || !data || data.length === 0) {
        setIsDemo(true)
        // Filter demo
        let demo = DEMO_POSTS
        if (query) demo = demo.filter(p =>
          p.title?.toLowerCase().includes(query.toLowerCase()) ||
          p.description?.toLowerCase().includes(query.toLowerCase())
        )
        if (selectedCat) demo = demo.filter(p => p.category === selectedCat)
        if (selectedArea) demo = demo.filter(p => p.area === selectedArea)
        setResults(demo)
      } else {
        setIsDemo(false)
        setResults(data.map(p => ({ ...p, reaction_count: 0, comment_count: 0 })))
      }
    } catch {
      setIsDemo(true)
      setResults(DEMO_POSTS)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="search-page">
        {/* Search bar */}
        <div className="container search-bar-wrap">
          <div className="search-bar">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M13 13L10.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              ref={inputRef}
              className="search-bar__input"
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Events, venues, vibe…"
            />
            {query && (
              <button className="search-bar__clear" onClick={() => setQuery('')}>✕</button>
            )}
          </div>
        </div>

        {/* Category filter */}
        <div className="search-filters">
          <div className="search-filters__scroll">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                className={`filter-chip ${selectedCat === cat.value ? 'filter-chip--active' : ''}`}
                onClick={() => setSelectedCat(selectedCat === cat.value ? null : cat.value)}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Area filter */}
        <div className="search-filters">
          <div className="search-filters__scroll">
            {AREAS.slice(0, 8).map(area => (
              <button
                key={area}
                className={`filter-chip ${selectedArea === area ? 'filter-chip--active' : ''}`}
                onClick={() => setSelectedArea(selectedArea === area ? null : area)}
              >
                📍 {area}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {!searched && (
          <div className="empty-state" style={{ paddingTop: 'var(--space-2xl)' }}>
            <span className="empty-state__icon">🔍</span>
            <p className="empty-state__title">Search Friday</p>
            <p className="empty-state__desc">Find parties, restaurant nights, campus events and more in Gaborone.</p>
          </div>
        )}

        {searched && (
          <>
            {!loading && (
              <p className="search-count container">
                {results.length} {results.length === 1 ? 'event' : 'events'} found
                {isDemo && ' (demo)'}
              </p>
            )}
            <PostFeed posts={results} loading={loading} isDemo={isDemo} />
          </>
        )}
      </div>

      <style>{`
        .search-page { display: flex; flex-direction: column; gap: var(--space-sm); }

        .search-bar-wrap { padding-top: var(--space-md); padding-bottom: var(--space-xs); }

        .search-bar {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: 13px 16px;
          background: var(--bg-input);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-full);
          color: var(--text-tertiary);
          transition: border-color var(--transition);
        }

        .search-bar:focus-within {
          border-color: var(--border-strong);
          color: var(--text-secondary);
        }

        .search-bar__input {
          flex: 1;
          background: none;
          color: var(--text-primary);
          font-size: 16px;
          font-family: var(--font);
          -webkit-appearance: none;
        }

        .search-bar__input::placeholder { color: var(--text-tertiary); }

        .search-bar__clear {
          font-size: 12px;
          color: var(--text-tertiary);
          width: 20px; height: 20px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 50%;
          background: var(--bg-elevated);
        }

        .search-filters { overflow: hidden; }
        .search-filters__scroll {
          display: flex;
          gap: var(--space-sm);
          overflow-x: auto;
          padding: 4px var(--space-md);
          scrollbar-width: none;
        }
        .search-filters__scroll::-webkit-scrollbar { display: none; }

        .search-count {
          font-size: 13px;
          color: var(--text-tertiary);
          font-weight: 500;
          padding-top: var(--space-sm);
        }
      `}</style>
    </div>
  )
}
