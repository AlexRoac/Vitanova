import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import "./navbar.css";
import { default as logoV3 } from "../../assets/Logo_Vita3.png";
import { default as logoV4 } from "../../assets/Logo_Vita4.png";

function NavBar() {
    const navigate = useNavigate();
    
    // Guardamos todo el objeto del usuario, no solo si está logueado
    const [usuario, setUsuario] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const usuarioGuardado = localStorage.getItem("usuario");
        
        if (token && usuarioGuardado) {
            setUsuario(JSON.parse(usuarioGuardado));
        } else {
            setUsuario(null);
        }
    }, []);

    const handleLogin = () => navigate("/login");
    const handleRegister = () => navigate("/register");

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        setUsuario(null);
        navigate("/inicio   ");
    };

    return (
        <div className="container-nav">
            <div className="logo-container">
                <a href="/inicio">
                    <img src={logoV3} alt="Logo V3" className="logoV3" />
                    <img src={logoV4} alt="Logo V4" className="logoV4" />
                </a>
            </div>
            
            <div className="menubtn-container">
                {usuario ? (
                    // ==========================================
                    // SI EL USUARIO ESTÁ LOGUEADO (Vemos su rol)
                    // ==========================================
                    <>
                        {/* Botones SOLO para el ADMIN */}
                        {usuario.rol === 'admin' && (
                            <button className="menu-btn" onClick={() => navigate("/dashboard")}>Panel Admin</button>
                        )}

                        {/* Botones SOLO para el PSICÓLOGO */}
                        {usuario.rol === 'psicologo' && (
                            <button className="menu-btn" onClick={() => navigate("/dashboard")}>Mis Pacientes</button>
                        )}

                        {/* Botones SOLO para el PACIENTE */}
                        {usuario.rol === 'paciente' && (
                            <button className="menu-btn" onClick={() => navigate("/dashboard")}>Mis Citas</button>
                        )}

                        {/* Botón COMPARTIDO (Todos lo ven si iniciaron sesión) */}
                        <button className="menu-btn logout-btn" onClick={handleLogout}>Cerrar sesión</button>
                    </>
                ) : (
                    // ==========================================
                    // SI ES UN VISITANTE SIN SESIÓN
                    // ==========================================
                    <>
                        <button className="menu-btn" onClick={handleLogin}>Iniciar sesión</button>
                        <button className="menu-btn" onClick={handleRegister}> Regístrate</button>
                    </>
                )}
            </div>
        </div>
    )
}

export default NavBar;