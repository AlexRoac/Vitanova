import "./error404.css";
import { Link } from "react-router-dom";
function Error404() {
    return (
        <>
        <div className="error-container">
      <div className="error-box">
        <h1 className="error-title">404</h1>
        <p className="error-text">No encontramos esta página</p>

        <Link to="/login" className="error-btn">
          Volver al inicio
        </Link>
      </div>
    </div>
        </>
    )
}
export default Error404;