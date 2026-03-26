import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar/navbar';
import Footer from '../components/Footer/Footer';
import DashboardAdmin from '../components/Dashboard/DashboardAdmin';
import DashboardPsico from '../components/Dashboard/DashboardPsico';
import DashboardUser from '../components/Dashboard/DashboardUser';

function Dashboard() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    }
  }, []);

  if (!usuario) return <div>Cargando...</div>;

  return (
    <div className="page-container">
      <NavBar />
      
      <div className="page-content">
        {usuario.rol === 'admin' && <DashboardAdmin usuario={usuario} />}
        {usuario.rol === 'psicologo' && <DashboardPsico usuario={usuario} />}
        {usuario.rol === 'paciente' && <DashboardUser usuario={usuario} />}
      </div>

      <Footer />
    </div>
  );
}

export default Dashboard;