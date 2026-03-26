import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');
  const usuarioString = localStorage.getItem('usuario');

  if (!token || !usuarioString) {
    return <Navigate to="/login" replace />;
  }

  const usuario = JSON.parse(usuarioString);
  const rolUsuario = usuario.rol;

  if (!allowedRoles.includes(rolUsuario)) {
    if (rolUsuario === 'admin') {
      return <Navigate to="/dashboard" replace />;
    } else if (rolUsuario === 'psicologo') {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;