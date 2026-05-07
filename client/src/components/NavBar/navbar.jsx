import { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import "./navbar.css";
import { default as logoV3 } from "../../assets/Logo_Vita3.png";
import { default as logoV4 } from "../../assets/Logo_Vita4.png";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";

function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNav = (path) => { setMenuOpen(false); navigate(path); };
  const handleLogin = () => handleNav("/login");
  const handleRegister = () => handleNav("/register");

  const handleLogout = () => {
    Swal.fire({
      title: '¿Estás seguro?', text: "¿Deseas cerrar tu sesión actual?",
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#3a7d8c', cancelButtonColor: 'rgb(177, 78, 78)',
      confirmButtonText: 'Sí, cerrar sesión', cancelButtonText: 'Cancelar',
      scrollbarPadding: false,
    }).then(async (result) => {
      if (result.isConfirmed) {
        await logout(); // borra cookie httpOnly en el servidor + limpia contexto
        setMenuOpen(false);
        navigate("/inicio");
        Swal.fire({
          title: '¡Hasta luego!', text: 'Has cerrado sesión exitosamente.',
          icon: 'success', timer: 1000, showConfirmButton: false, scrollbarPadding: false,
        });
      }
    });
  };

  const renderLinks = () => {
    if (!usuario || ["/inicio", "/", "/terminos", "/experiencia"].includes(location.pathname)) {
      return (
        <>
          <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>Inicio</Link>
          <Link to="/experiencia" className="nav-link" onClick={() => setMenuOpen(false)}>Experiencia</Link>
          <Link to="/terminos" className="nav-link" onClick={() => setMenuOpen(false)}>Términos y condiciones</Link>
        </>
      );
    }
    switch (usuario.rol) {
      case 'psicologo':
        return location.pathname !== "/dashboard" ? (
          <>
            <Link to="/pacientes" className="nav-link" onClick={() => setMenuOpen(false)}>Mis pacientes</Link>
            <Link to="/historial" className="nav-link" onClick={() => setMenuOpen(false)}>Mi Historial</Link>
            <Link to="/horarios" className="nav-link" onClick={() => setMenuOpen(false)}>Mis Horarios</Link>
            <Link to="/automatizar-horarios" className="nav-link" onClick={() => setMenuOpen(false)}>Automatizar Horarios</Link>
          </>
        ) : null;
      case 'paciente':
        return location.pathname !== "/dashboard" ? (
          <>
            <Link to="/agendar" className="nav-link" onClick={() => setMenuOpen(false)}>Agendar citas</Link>
            <Link to="/citas" className="nav-link" onClick={() => setMenuOpen(false)}>Mis citas</Link>
          </>
        ) : null;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="container-nav" ref={menuRef}>
        <div className="logo-container">
          <Link to={location.pathname === "/inicio" ? "/inicio" : "/dashboard"}>
            <img src={logoV3} alt="Logo V3" className="logoV3" />
            <img src={logoV4} alt="Logo V4" className="logoV4" />
          </Link>
        </div>

        <div className="menubtn-container">
          {usuario ? (
            <>
              {location.pathname !== "/dashboard" && (
                <button className="menu-btn" onClick={() => navigate("/dashboard")}>Dashboard</button>
              )}
              {location.pathname === "/dashboard" && (
                <button className="menu-btn" onClick={() => navigate("/inicio")}>Inicio</button>
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
          aria-label="Abrir menú" aria-expanded={menuOpen}
        >
          <span></span><span></span><span></span>
        </button>

        {menuOpen && (
          <div className="mobile-menu open">
            <div className="nav-links-mobile">{renderLinks()}</div>
            <div className="divider"></div>
            {usuario ? (
              <>
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
      <nav className="nav">{renderLinks()}</nav>
    </>
  );
}
export default NavBar;