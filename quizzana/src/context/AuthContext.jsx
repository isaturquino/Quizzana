"use client"

import { createContext, useState, useEffect } from "react"
import { supabase } from "../services/supabase/supabaseClient"
import { signInWithEmail, signOut } from "../services/supabase/auth"

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession()
      setUser(data.session?.user || null)
      setLoading(false)
    }

    getSession()

    // Listener de sessão (login/logout/refresh)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null)
      }
    )

    return () => listener.subscription.unsubscribe()
  }, [])

  const login = async (email, password) => {
    const { data, error } = await signInWithEmail(email, password)
    if (error) return { error }

    setUser(data.user)
    return { data }
  }

  const logout = async () => {
    const { error } = await signOut()
    if (!error) setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      { children}
    </AuthContext.Provider>
  )
}
