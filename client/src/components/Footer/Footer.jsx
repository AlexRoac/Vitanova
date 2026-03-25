import "./Footer.css";

function Footer() {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        
        <div className="fcontainer seccion-1">
          <h3>Bienestar psicológico</h3>
          <p>Atención psicológica para tu salud mental.</p>
        </div>

        <div className="fcontainer seccion-2">
        <h3>Citas</h3>
        <ul className="footer-contact">
            <li>833 478 3849</li>
            <li>123 text example, text</li>
            <li>text.example@gmail.com</li>
        </ul>
        </div>

        <div className="fcontainer seccion-3">
          <h3>Historial clínico</h3>
          <p>Correo electrónico del paciente.</p>
          <input type="email" placeholder="Ingresa tu correo electrónico" className="footer-input" />
          <button className="footer-button">Llena aquí tu formulario</button>
        </div>

      </div>
    </footer>
  );
}

export default Footer;