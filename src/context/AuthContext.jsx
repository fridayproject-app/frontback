import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(authUser) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single()

      if (!error && data) {
        setProfile(data)
        return
      }

      // PGRST116 = no rows found — profile doesn't exist yet, auto-create it
      if (error?.code === 'PGRST116' || !data) {
        const emailBase = (authUser.email || '').split('@')[0]
          .replace(/[^a-z0-9_]/gi, '')
          .toLowerCase()
        const username = `${emailBase}${Math.floor(Math.random() * 9000) + 1000}`
        const display_name = emailBase || 'Friday User'

        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({ user_id: authUser.id, username, display_name })
          .select()
          .single()

        if (!insertError && newProfile) {
          setProfile(newProfile)
        } else {
          console.warn('Auto-create profile failed:', insertError?.message)
        }
      }
    } catch (e) {
      console.warn('Profile fetch error:', e)
    } finally {
      setLoading(false)
    }
  }

  async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: 'https://frontback-rose.vercel.app/auth/confirm',
    },
  })

  if (error) throw error
  return data
}

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function signOut() {
    await supabase.auth.signOut({ scope: 'local' })
    setUser(null)
    setProfile(null)
  }

  async function refreshProfile() {
    if (user) await fetchProfile(user)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
