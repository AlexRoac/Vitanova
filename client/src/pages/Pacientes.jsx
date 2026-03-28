import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar/navbar';
import Footer from '../components/Footer/Footer';
import PacientesGestion from '../components/Pacientes/PacientesGestion';

function Pacientes() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    }
  }, []);

  // Si todavía no carga el usuario, mostramos una pantalla en blanco o un loader
  if (!usuario) return <div>Cargando...</div>;

  return (
    <div className="page-container">
      <NavBar />
      
      <div className="page-content">
        <PacientesGestion />
      </div>

      <Footer />
    </div>
  );
}

export default Pacientes;