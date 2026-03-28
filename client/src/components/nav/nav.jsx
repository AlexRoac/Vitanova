import './nav.css';
import { Link } from 'react-router-dom';

function Nav() {
    return (
        <nav className="nav">
            <Link to="/" className="nav-link">Inicio</Link>
            <Link to="/experiencia" className="nav-link">Experiencia</Link>
            <Link to="/reviews" className="nav-link">Reseñas</Link>
            <Link to="/terms" className="nav-link">Terminos y condiciones</Link>
        </nav>
    );
}

export default Nav;