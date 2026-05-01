import { useState, useEffect, useRef } from "react";
// 1. Importamos useLocation para detectar la ruta actual
import { useNavigate, Link, useLocation } from "react-router-dom";
import "./navbar.css";
import { default as logoV3 } from "../../assets/Logo_Vita3.png";
import { default as logoV4 } from "../../assets/Logo_Vita4.png";
import Swal from "sweetalert2";

function NavBar() {
    const navigate = useNavigate();
    const location = useLocation(); // Hook para obtener la ruta actual
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

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleNav = (path) => {
        setMenuOpen(false);
        navigate(path);
    };

    const handleLogin = () => handleNav("/login");
    const handleRegister = () => handleNav("/register");

    const handleLogout = () => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "¿Deseas cerrar tu sesión actual?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3a7d8c',
            cancelButtonColor: 'rgb(177, 78, 78)',
            confirmButtonText: 'Sí, cerrar sesión',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem("token");
                localStorage.removeItem("usuario");
                setUsuario(null);
                setMenuOpen(false);
                navigate("/inicio");
                Swal.fire('¡Hasta luego!', 'Has cerrado sesión exitosamente.', 'success');
            }
        });
    };

    // 2. Lógica para renderizar los links según el rol y la ubicación
    const renderLinks = () => {
        // Si el usuario no está logueado O si está en la página de inicio, mostramos el menú estándar
        if (!usuario || location.pathname === "/inicio" || location.pathname === "/") {
            return (
                <>
                    <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>Inicio</Link>
                    <Link to="/experiencia" className="nav-link" onClick={() => setMenuOpen(false)}>Experiencia</Link>
                    <Link to="/terminos" className="nav-link" onClick={() => setMenuOpen(false)}>Términos y condiciones</Link>
                </>
            );
        }

        // Si está en el Dashboard o cualquier otra ruta privada, mostramos links por rol
        switch (usuario.rol) {
            case 'admin':
                return (
                    <>
                        <Link to="/gestion" className="nav-link" onClick={() => setMenuOpen(false)}>Gestión de usuarios</Link>
                    </>
                );
            case 'psicologo':
                return (
                    <>
                        <Link to="/pacientes" className="nav-link" onClick={() => setMenuOpen(false)}>Mis pacientes</Link>
                        <Link to="/historial" className="nav-link" onClick={() => setMenuOpen(false)}>Mi Historial</Link>
                        <Link to="/horarios" className="nav-link" onClick={() => setMenuOpen(false)}>Mis Horarios</Link>
                    </>
                );
            case 'paciente':
                return (
                    <>
                        <Link to="/agendar" className="nav-link" onClick={() => setMenuOpen(false)}>Agendar citas</Link>
                        <Link to="/citas" className="nav-link" onClick={() => setMenuOpen(false)}>Mis citas</Link>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <div className="container-nav" ref={menuRef}>
                <div className="logo-container">
                    {location.pathname !== "/inicio" && (
                                    <Link to="/dashboard">
                                        <img src={logoV3} alt="Logo V3" className="logoV3" />
                                        <img src={logoV4} alt="Logo V4" className="logoV4" />
                                    </Link>
                    )}
                    {location.pathname === "/inicio" && (
                                    <Link to="/inicio">
                                        <img src={logoV3} alt="Logo V3" className="logoV3" />
                                        <img src={logoV4} alt="Logo V4" className="logoV4" />
                                    </Link>
                    )}
                </div>

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

                <button
                    className={`hamburger-btn ${menuOpen ? "open" : ""}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Abrir menú"
                    aria-expanded={menuOpen}
                >
                    <span></span><span></span><span></span>
                </button>

                {menuOpen && (
                    <div className="mobile-menu open">
                        <div className="nav-links-mobile">
                            {/* 3. Llamamos a la función que renderiza los links dinámicos */}
                            {renderLinks()}
                        </div>

                        <div className="divider"></div>

                        {usuario ? (
                            <>
                                {/* Opcional: Podrías ocultar el botón Dashboard si ya estás en él */}
                                {location.pathname !== "/dashboard" && (
                                    <button className="menu-btn" onClick={() => handleNav("/dashboard")}>Dashboard</button>
                                )}
                                {location.pathname !== "/inicio" && (
                                    <button className="menu-btn" onClick={() => handleNav("/inicio")}>Inicio</button>
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

            {/* SEGUNDO NAV (Desktop) - También lo hacemos dinámico para que sea coherente */}
            <nav className="nav">
                {renderLinks()}
            </nav>
        </>
    );
}

export default NavBar;