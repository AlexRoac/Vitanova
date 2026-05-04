import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

import Login from './pages/Login';
import Register from './pages/Register';
import Inicio from './pages/Inicio';
import Dashboard from './pages/Dashboard';
import Gestion from './pages/Gestion';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Error404 from './components/Error404/error404';
import CompletarPerfil from './pages/CompletarPerfil';
import PacientesGestion from './pages/Pacientes';
import DisponibilidadPage from './pages/Disponibilidad';
import AgendarCita from './pages/AgendarCita';
import MisCitas from './pages/MisCitas';
import Historial from './pages/Historial';
import TerminosPage from './pages/Terminos';
import './App.css';
import ExperienciaPage from './pages/Experiencia';
import PublicRoute from './components/ProtectedRoute/PublicRoute';
import AutomatizarPage from './pages/AutomatizarPage';

function App() {
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/inicio" />} />
          <Route path="/inicio" element={<Inicio />} />
          <Route path="/terminos" element={<TerminosPage />} />
          <Route path="/experiencia" element={<ExperienciaPage />} />
          <Route path="*" element={<Error404 />} />

          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/completar-perfil" element={<CompletarPerfil />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['paciente', 'psicologo', 'admin']} />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['paciente']} />}>
            <Route path="/agendar" element={<AgendarCita />} />
            <Route path="/citas" element={<MisCitas />} />
          </Route>
          
          <Route element={<ProtectedRoute allowedRoles={['psicologo']} />}>
            <Route path="/pacientes" element={<PacientesGestion />} />
            <Route path="/horarios" element={<DisponibilidadPage />} />
            <Route path="/automatizar-horarios" element={<AutomatizarPage />} />
            <Route path="/historial" element={<Historial />} />
          </Route>
          
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/gestion" element={<Gestion />} />
          </Route>

        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;