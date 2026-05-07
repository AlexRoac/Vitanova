import { useAuth } from "../../context/AuthContext";
import "./Dashboard.css";

function DashboardPsico() {

    const { usuario } = useAuth();

    return (
        <>
        <div className="container-cards">
            <h1>Bienvenido, {usuario?.nombre || "Cargando..."}</h1>
            
            <div className="row m-4">
                <div className="col-lg-6 col-md-12 col-sm-12 colcard">
                    <a href="/pacientes">
                        <div className="card p-2 align-items-center">
                            <h1>📖</h1>
                            <h1>Mis Pacientes</h1>
                            <p className="card-text">ver mis Pacientes </p>
                        </div>
                    </a>
                </div>
                <div className="col-lg-6 col-md-12 col-sm-12 colcard">
                    <a href="/historial">
                        <div className="card  p-2 align-items-center">
                            <h1>📅</h1>
                            <h1>Mi Historial</h1>
                            <p className="card-text">ver mi Historial </p>
                        </div>
                    </a>
                </div>
                <div className="col-lg-6 col-md-12 col-sm-12 colcard">
                    <a href="/horarios">
                        <div className="card  p-2 align-items-center">
                            <h1>📅</h1>
                            <h1>Mis Horarios</h1>
                            <p className="card-text">ver mis Horarios </p>
                        </div>
                    </a>
                </div>
            </div>
        </div>
        </>
    )
}

export default DashboardPsico;