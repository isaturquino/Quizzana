"use client"

import { createContext, useState, useEffect } from "react"
import { supabase } from "../services/supabase/supabaseClient"
import { signInWithEmail, signOut } from "../services/supabase/auth"

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // --- Mantém sessão ativa ---
    const getSession = async () => {
      const { data } = await supabase.auth.getSession()
      const sessionUser = data.session?.user || null
      if (sessionUser) {
        await setUserWithRole(sessionUser)
      }
      setLoading(false)
    }

    getSession()

    // --- Listener de alterações de auth ---
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const sessionUser = session?.user || null
        await setUserWithRole(sessionUser)
      }
    )

    // --- Cria usuário padrão (somente dev) ---
    const createDefaultAdmin = async () => {
      const email = "admin@quizzana.com"
      const password = "admin123"

      // Checa se já existe na tabela administrador
      const { data: existingAdmin } = await supabase
        .from("administrador")
        .select("*")
        .eq("email", email)
        .single()

      if (!existingAdmin) {
        // Cria usuário no Supabase Auth
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { nome: "Super Admin" } }
        })

        if (error) {
          console.log("Erro ao criar usuário padrão:", error.message)
          return
        }

        // Insere na tabela administrador
        await supabase.from("administrador").insert({
          id_auth: data.user.id,
          nome: "Super Admin",
          email,
        })

        console.log("Usuário padrão criado com sucesso!")
      }
    }

    createDefaultAdmin()

    return () => listener.subscription.unsubscribe()
  }, [])

  // --- Função para adicionar role ao usuário ---
  const setUserWithRole = async (sessionUser) => {
    if (!sessionUser) {
      setUser(null)
      return
    }

    const { data: adminData } = await supabase
      .from("administrador")
      .select("*")
      .eq("id_auth", sessionUser.id)
      .single()

    setUser({
      ...sessionUser,
      role: adminData ? "admin" : "user",
    })
  }

  // --- Login ---
  const login = async (email, password) => {
    const { data, error } = await signInWithEmail(email, password)
    if (error) return { error }

    await setUserWithRole(data.user)
    return { data }
  }

  // --- Logout ---
  const logout = async () => {
    await signOut()
    setUser(null)
  }

  const value = { user, loading, login, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
