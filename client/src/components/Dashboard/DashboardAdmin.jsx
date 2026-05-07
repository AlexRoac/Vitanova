import { useAuth } from "../../context/AuthContext";
import "./Dashboard.css";

function DashboardAdmin() {
  const { usuario } = useAuth();

  return (
    <div className="container-cards">
      <h1>Panel de Control (Admin): {usuario.nombre}</h1>
      <div className="row m-4">
       
        <div className="col-lg-12 colcard">
            <a href="/gestion">
          <div className="card p-4 text-center">
            <h2>👥 Gestión de Usuarios</h2>
            <p>Aquí irá tu tabla para ver pacientes y psicólogos.</p>
          </div>
          </a>
        </div>
      </div>
    </div>
  );
}

export default DashboardAdmin;