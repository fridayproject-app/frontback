import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/layout/Layout'

import Home from './pages/Home'
import Search from './pages/Search'
import Create from './pages/Create'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import PostDetail from './pages/PostDetail'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'

import './styles/globals.css'

// PWA install prompt capture
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  window.deferredPrompt = e
})

function AppRoutes() {
  return (
    <Routes>
      {/* Auth pages — no Layout wrapper */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* App pages — with Layout */}
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/search" element={<Layout><Search /></Layout>} />
      <Route path="/create" element={<Layout><Create /></Layout>} />
      <Route path="/profile" element={<Layout><Profile /></Layout>} />
      <Route path="/profile/:username" element={<Layout><Profile /></Layout>} />
      <Route path="/settings" element={<Layout><Settings /></Layout>} />
      <Route path="/post/:id" element={<Layout><PostDetail /></Layout>} />

      {/* 404 */}
      <Route path="*" element={
        <Layout>
          <div className="page">
            <div className="empty-state" style={{ minHeight: '70vh' }}>
              <span className="empty-state__icon">🌙</span>
              <p className="empty-state__title">Page not found</p>
              <a href="/" className="btn btn-ghost" style={{ marginTop: 'var(--space-md)' }}>
                Back to Home
              </a>
            </div>
          </div>
        </Layout>
      } />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
