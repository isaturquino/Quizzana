"use client"
import { useState } from "react"
import { Link } from "react-router-dom"
import { Mail, Lock } from "lucide-react"
import googleLogo from "../../assets/imgs/googlelogo.png"
import { useAuth } from "../../hooks/useAuth" 
import { signInWithGoogle } from "../../services/supabase/auth"

import "./LoginPage.css"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
  })

  const { login } = useAuth() // pega login do contexto

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const { error } = await login(formData.email, formData.senha)

    if (error) {
      alert("Erro ao fazer login: " + error.message)
    } else {
      alert("Login realizado!")
      setFormData({ email: "", senha: "" })
    }
  }

  const handleGoogleLogin = async () => {
    const { error } = await signInWithGoogle()
    if (error) {
      alert("Erro ao logar com Google: " + error.message)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <div className="login-brand">
            <span className="brand-name">Quizzana</span>
          </div>
          <div className="login-welcome">
            <h1>
              Olá,
              <br />
              que bom que voltou.
            </h1>
            <p>Acesse sua conta e gerencie quizzes de forma prática.</p>
          </div>
        </div>

        <div className="login-right">
          <div className="login-form-container">
            <h2>Faça login</h2>
            <p className="login-subtitle">Entre com seus dados para acessar sua conta</p>

            <button type="button" className="btn-google" onClick={handleGoogleLogin}>
              <img src={googleLogo} alt="Google logo" className="google-icon" />
              Google
            </button>

            <div className="divider">
              <span>OU</span>
            </div>

            <form onSubmit={handleSubmit}>
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
                Entrar
              </button>

              <p className="form-footer">
                Não tem uma conta? <Link to="/register">Inscreva-se</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
