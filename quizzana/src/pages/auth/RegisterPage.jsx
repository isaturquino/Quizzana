"use client"
import { useState } from "react"
import { Link } from "react-router-dom"
import { User, Mail, Lock } from "lucide-react"
import googleLogo from "../../assets/imgs/googlelogo.png"
import { signUpWithEmail, signInWithGoogle } from "../../services/supabase/auth"
import { supabase } from "../../services/supabase/supabaseClient"

import "./RegisterPage.css"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  // --- Registro com email/senha ---
  const handleSubmit = async (e) => {
    e.preventDefault()

    // 1️⃣ Cria usuário no Supabase Auth
    const { data, error } = await signUpWithEmail(formData)
    if (error) {
      alert("Erro ao registrar: " + error.message)
      return
    }

    const userId = data.user.id

    // 2️⃣ Insere na tabela administrador
    const { error: insertError } = await supabase.from("administrador").insert({
      id_auth: userId,
      nome: formData.nome,
      email: formData.email,
    })

    if (insertError) {
      alert("Erro ao salvar administrador: " + insertError.message)
      return
    }

    alert("Conta criada com sucesso!")
    setFormData({ nome: "", email: "", senha: "" })
  }

  // --- Registro com Google ---
  const handleGoogleSignup = async () => {
    const { data, error } = await signInWithGoogle()
    if (error) {
      alert("Erro ao registrar com Google: " + error.message)
      return
    }

    const userId = data.user.id

    // Checa se já existe na tabela administrador
    const { data: existingAdmin } = await supabase
      .from("administrador")
      .select("*")
      .eq("id_auth", userId)
      .single()

    if (!existingAdmin) {
      await supabase.from("administrador").insert({
        id_auth: userId,
        nome: data.user.user_metadata.nome || "Admin Google",
        email: data.user.email,
      })
    }

    alert("Conta criada com Google com sucesso!")
  }

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-left">
          <div className="register-brand">
            <span className="brand-name">Quizzana</span>
          </div>
          <div className="register-welcome">
            <h1>
              Olá,
              <br />
              seja bem-vindo.
            </h1>
            <p>
              Crie quizzes interativos, gerencie questões e acompanhe resultados em tempo real para tornar o aprendizado
              mais dinâmico.
            </p>
          </div>
        </div>

        <div className="register-right">
          <div className="register-form-container">
            <h2>Crie sua conta</h2>
            <p className="register-subtitle">Utilize sua conta Google para se cadastrar</p>

            <button type="button" className="btn-google" onClick={handleGoogleSignup}>
              <img src={googleLogo} alt="Google logo" className="google-icon" />
              Google
            </button>

            <div className="divider">
              <span>OU</span>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="nome">Nome</label>
                <div className="input-wrapper">
                  <User className="input-icon" size={20} />
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    placeholder="Maria Silva"
                    value={formData.nome}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={20} />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="nome@exemplo.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="senha">Senha</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={20} />
                  <input
                    type="password"
                    id="senha"
                    name="senha"
                    placeholder="••••••••••"
                    value={formData.senha}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-secondary2">
                Inscrever-se
              </button>

              <p className="form-footer">
                Já possui uma conta? <Link to="/login">Entrar</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
