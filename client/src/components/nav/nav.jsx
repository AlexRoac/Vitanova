import './nav.css';
import { Link } from 'react-router-dom';

function Nav() {
    return (
        <nav className="nav">
            <Link to="/" className="nav-link">Inicio</Link>
            <Link to="/experiencia" className="nav-link">Experiencia</Link>
            <Link to="/terms" className="nav-link" id='terms'>Terminos y condiciones</Link>
        </nav>
    );
}

export default Nav;