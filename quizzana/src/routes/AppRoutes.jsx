import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import ProtectedRoute from "../components/layout/ProtectedRoute";

// Auth Pages
import Login from "../pages/auth/LoginPage";
import Register from "../pages/auth/RegisterPage";

// Admin Pages
import Dashboard from "../pages/admin/DashboardPage";
import Questions from "../pages/admin/QuestionsPage";
import CreateQuiz from "../pages/admin/CreateQuizPage";
import ManageSalas from "../pages/admin/ManageSalaPage";
import Biblioteca from "../pages/admin/BibliotecaQuizPage";

// Player Pages
import JoinGame from "../pages/player/JoinGame";
import WaitingRoom from "../pages/player/WaitingRoom";
import PlayQuiz from "../pages/player/PlayQuizPage";
import Results from "../pages/player/ResultsPage";

// Common Pages
import NotFound from "../pages/NotFound";

function AppRoutes() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/questions"
            element={
              <ProtectedRoute requiredRole="admin">
                <Questions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/create-quiz"
            element={
              <ProtectedRoute requiredRole="admin">
                <CreateQuiz />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/create-quiz/:id"
            element={
              <ProtectedRoute requiredRole="admin">
                <CreateQuiz />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/biblioteca"
            element={
              <ProtectedRoute requiredRole="admin">
                <Biblioteca />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/salas"
            element={
              <ProtectedRoute requiredRole="admin">
                <ManageSalas />
              </ProtectedRoute>
            }
          />

          {/* Player Routes */}
          <Route
            path="/join"
            element={
              <ProtectedRoute>
                <JoinGame />
              </ProtectedRoute>
            }
          />
          <Route
            path="/waiting-room/:salaId"
            element={
              <ProtectedRoute>
                <WaitingRoom />
              </ProtectedRoute>
            }
          />
          <Route
            path="/play/:salaId"
            element={
              <ProtectedRoute>
                <PlayQuiz />
              </ProtectedRoute>
            }
          />
          <Route
            path="/results/:salaId"
            element={
              <ProtectedRoute>
                <Results />
              </ProtectedRoute>
            }
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default AppRoutes;
