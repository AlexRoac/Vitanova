import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import "./hero.css";
import {default as psicologia} from "../../assets/psicologia.png";

function Hero() {
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
        navigate("/login");
    };
    return (
    <>
    <section className="hero">
        <div className="hero-container">
        <div className="hero-text">
            <span className="hero-tag">Atención psicológica profesional</span>
            <h1>
            Cuida tu salud mental <br/>
            con el mismo compromiso que tu salud física
            </h1>
            <p>
            Ignorar el problema no lo hace desaparecer. 
            Da el primer paso hacia tu bienestar emocional.
            </p>
            <div className="hero-buttons">
            {usuario ? (
                <button 
                    onClick={() => {
                        if (usuario.rol === "psicologo" || usuario.id_rol === 2) {
                            navigate("/historial"); // vista del psicólogo
                        } else {
                            navigate("/agendar"); // paciente
                        }
                    }} 
                    className="btn-primary"
                >
                    Agendar cita
                </button>
            ) : (
                <button onClick={handleLogin} className="btn-primary">
                    Agendar cita
                </button>
            )}
            <a href="/dashboard" className="btn-secondary">Ver servicios</a>
            </div>
        </div>
        <div className="hero-image">
            <img src={psicologia} alt="Psicología"/>
        </div>
        </div>
    </section>
    </>
    )
}
export default Hero;