"use client"

import { createContext, useState, useEffect } from "react"

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Verificar se usuário está autenticado (localStorage ou Supabase)
    setLoading(false)
  }, [])

  const login = (email, password) => {
    // TODO: Implementar login com Supabase
    console.log("Login:", email)
  }

  const logout = () => {
    setUser(null)
    // TODO: Implementar logout com Supabase
  }

  const value = {
    user,
    loading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
