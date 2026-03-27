import "./error404.css";
import { useNavigate } from "react-router-dom";

function Error404() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    // Obtenemos de que pagina viene el usuario
    const referrer = document.referrer;
    
    // Obtenemos el dominio actual de tu app (ej: localhost:3000 o tuweb.com)
    const currentDomain = window.location.origin;

    // 3. Solo retrocedemos si el 'referrer' incluye nuestro dominio
    // Esto evita que el usuario se salga de tu web al picarle al botón.
    if (referrer && referrer.includes(currentDomain)) {
      navigate(-1);
    } else {
      // Plan B: Si entró directo o viene de Google/Facebook/etc.
      navigate("/inicio");
    }
  };

  return (
    <>
      <div className="error-container">
        <div className="error-box">
          <h1 className="error-title">404</h1>
          <p className="error-text">No encontramos esta página</p>

          <button type="button" onClick={handleGoBack} className="error-btn">
            Volver
          </button>
        </div>
      </div>
    </>
  );
}

export default Error404;