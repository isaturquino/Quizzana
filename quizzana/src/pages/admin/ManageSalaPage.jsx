import "./ManageSalaPage.css";
import { useNavigate } from "react-router-dom";

export default function ManageSalaPage() {
  const navigate = useNavigate();

  return (
    <div className="manage-container">
      <h1>Gerenciar Salas</h1>

      <button
        className="ms-create-sala-btn"
        onClick={() => navigate("/waiting-room/123")}
      >
        Criar Sala
      </button>

      <button
        className="ms-view-dashboard-btn"
        onClick={() => navigate("/admin")}
      >
        Voltar ao Dashboard
      </button>
    </div>
  );
}
