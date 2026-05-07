import { useAuth } from "../../context/AuthContext";
import "./Dashboard.css";

function DashboardUser() {

    const { usuario } = useAuth();

    return (
        <>
        <div className="container-cards">
            <h1>Bienvenido, {usuario?.nombre || "Cargando..."}</h1>
            
            <div className="row m-4">
                <div className="col-lg-6 col-md-12 col-sm-12 colcard">
                    <a href="/agendar">
                        <div className="card p-2 align-items-center">
                            <h1>📖</h1>
                            <h1>Agendar cita</h1>
                            <p className="card-text">Programar una nueva cita</p>
                        </div>
                    </a>
                </div>
                <div className="col-lg-6 col-md-12 col-sm-12 colcard">
                    <a href="/citas">
                        <div className="card  p-2 align-items-center">
                            <h1>📅</h1>
                            <h1>Mis Citas</h1>
                            <p className="card-text">Ver citas programadas</p>
                        </div>
                    </a>
                </div>
            </div>
        </div>
        </>
    )
}

export default DashboardUser;