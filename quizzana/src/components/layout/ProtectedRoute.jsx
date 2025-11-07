import { useContext } from "react"
import { AuthContext } from "../../context/AuthContext"
import { Navigate } from "react-router-dom"

function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useContext(AuthContext)

  // Enquanto estiver carregando, mostra algo simples
  if (loading) return <div>Carregando...</div>

  // 🔧 TEMPORÁRIO: permitir acesso mesmo sem login
  // Retire esse bloco quando implementar autenticação real
  return children

  // --- Código original (para usar depois) ---
  /*
  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return children
  */
}

export default ProtectedRoute
