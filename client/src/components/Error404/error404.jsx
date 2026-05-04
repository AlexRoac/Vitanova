import "./error404.css";
import { useNavigate } from "react-router-dom";

function Error404() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    const referrer = document.referrer;
    
    const currentDomain = window.location.origin;

    if (referrer && referrer.includes(currentDomain)) {
      navigate(-1);
    } else {
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