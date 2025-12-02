import { supabase } from "./supabaseClient"

// --- REGISTRO COM EMAIL/SENHA ---
export async function signUpWithEmail({ nome, email, senha }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: {
      data: { nome } // salva no user_metadata
    }
  })
  return { data, error }
}

// --- LOGIN COM EMAIL/SENHA ---
export async function signInWithEmail(email, senha) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  })
  return { data, error }
}

// --- LOGIN COM GOOGLE ---
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
  })
  return { data, error }
}

// --- LOGOUT ---
export async function signOut() {
  return await supabase.auth.signOut()
}
