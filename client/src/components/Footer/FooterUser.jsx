function FooterUser({ handleClick }) {
  return (
    <footer className="main-footer">
      <div className="footer-container">

        <div className="fcontainer seccion-1">
          <h3>Tu panel</h3>
          <p>Accede a tus servicios y seguimiento psicológico.</p>
        </div>

        <div className="fcontainer seccion-2">
          <h3>Soporte</h3>
          <ul className="footer-contact">
            <li>📞 833 478 3849</li>
            <li>✉️ soporte@tuapp.com</li>
            <li>🕐 Atención 24/7</li>
          </ul>
        </div>

        <div className="fcontainer seccion-3">
          <h3>Acceso rápido</h3>
          <p>Ir a tu panel principal</p>
          <button className="footer-button" onClick={handleClick}>
            Ir a mi dashboard
          </button>
        </div>

      </div>
      <hr className="footer-divider" />
      <div className="footer-bottom">
        <span className="footer-copyright">
          © 2026 <span>Vitanova Psicología</span> · Todos los derechos reservados
        </span>
      </div>
    </footer>
  );
}

export default FooterUser;