import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./hero.css";
import { default as psicologia } from "../../assets/psicologia.png";

function Hero() {
    const navigate = useNavigate();
    const { usuario, logout } = useAuth();

    const handleLogin    = () => navigate("/login");
    const handleRegister = () => navigate("/register");

    const handleLogout = async () => {
        await logout();
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
                            navigate("/historial");
                        } else {
                            navigate("/agendar");
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
            <a href="/experiencia" className="btn-secondary">Experiencia</a>
            </div>
        </div>
        <div className="hero-image">
            <img src={psicologia} alt="Psicología"/>
        </div>
        </div>
    </section>
    </>
    );
}

export default Hero;