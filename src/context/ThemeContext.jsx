import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('friday-theme') || 'device'
  })

  const resolvedTheme = (() => {
    if (theme === 'device') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return theme
  })()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme)

    // Update meta theme-color
    const metaTheme = document.getElementById('theme-color-meta')
    if (metaTheme) {
      metaTheme.setAttribute('content', resolvedTheme === 'dark' ? '#000000' : '#f5f5f7')
    }
  }, [resolvedTheme])

  // Listen for OS theme changes
  useEffect(() => {
    if (theme !== 'device') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      document.documentElement.setAttribute('data-theme', mq.matches ? 'dark' : 'light')
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  const setAndSaveTheme = (t) => {
    setTheme(t)
    localStorage.setItem('friday-theme', t)
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme: setAndSaveTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
