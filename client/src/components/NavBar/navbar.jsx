import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./navbar.css";
import { default as logoV3 } from "../../assets/Logo_Vita3.png";
import { default as logoV4 } from "../../assets/Logo_Vita4.png";

function NavBar() {
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const usuarioGuardado = localStorage.getItem("usuario");

        if (token && usuarioGuardado) {
            setUsuario(JSON.parse(usuarioGuardado));
        } else {
            setUsuario(null);
        }
    }, []);

    // Cerrar menú al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Cerrar menú al cambiar de ruta
    const handleNav = (path) => {
        setMenuOpen(false);
        navigate(path);
    };

    const handleLogin = () => handleNav("/login");
    const handleRegister = () => handleNav("/register");

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        setUsuario(null);
        setMenuOpen(false);
        navigate("/inicio");
    };

    return (
        <>
            {/* ===== NAVBAR PRINCIPAL ===== */}
            <div className="container-nav" ref={menuRef}>
                <div className="logo-container">
                    <a href="/inicio">
                        <img src={logoV3} alt="Logo V3" className="logoV3" />
                        <img src={logoV4} alt="Logo V4" className="logoV4" />
                    </a>
                </div>

                {/* Botones visibles en DESKTOP */}
                <div className="menubtn-container">
                    {usuario ? (
                        <>
                            {(usuario.rol === 'admin' || usuario.rol === 'psicologo' || usuario.rol === 'paciente') && (
                                <button className="menu-btn" onClick={() => navigate("/dashboard")}>Dashboard</button>
                            )}
                            <button className="menu-btn logout-btn" onClick={handleLogout}>Cerrar sesión</button>
                        </>
                    ) : (
                        <>
                            <button className="menu-btn" onClick={handleLogin}>Iniciar sesión</button>
                            <button className="menu-btn" onClick={handleRegister}>Regístrate</button>
                        </>
                    )}
                </div>

                {/* Botón hamburguesa visible en MÓVIL */}
                <button
                    className={`hamburger-btn ${menuOpen ? "open" : ""}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Abrir menú"
                    aria-expanded={menuOpen}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                {/* ===== MENÚ DESPLEGABLE MÓVIL ===== */}
                {menuOpen && (
                    <div className="mobile-menu open">
                        {/* Links de navegación (segundo nav) */}
                        <div className="nav-links-mobile">
                            <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>Inicio</Link>
                            <Link to="/experiencia" className="nav-link" onClick={() => setMenuOpen(false)}>Experiencia</Link>
                            <Link to="/terms" className="nav-link" onClick={() => setMenuOpen(false)}>Términos y condiciones</Link>
                        </div>

                        <div className="divider"></div>

                        {/* Botones de sesión */}
                        {usuario ? (
                            <>
                                {(usuario.rol === 'admin' || usuario.rol === 'psicologo' || usuario.rol === 'paciente') && (
                                    <button className="menu-btn" onClick={() => handleNav("/dashboard")}>Dashboard</button>
                                )}
                                <button className="menu-btn logout-btn" onClick={handleLogout}>Cerrar sesión</button>
                            </>
                        ) : (
                            <>
                                <button className="menu-btn" onClick={handleLogin}>Iniciar sesión</button>
                                <button className="menu-btn" onClick={handleRegister}>Regístrate</button>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* ===== SEGUNDO NAV (solo visible en DESKTOP) ===== */}
            <nav className="nav">
                <Link to="/" className="nav-link">Inicio</Link>
                <Link to="/experiencia" className="nav-link">Experiencia</Link>
                <Link to="/terms" className="nav-link" id="terms">Términos y condiciones</Link>
            </nav>
        </>
    );
}

export default NavBar;
