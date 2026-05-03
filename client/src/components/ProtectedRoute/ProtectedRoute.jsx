import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');
  const usuarioString = localStorage.getItem('usuario');

  // 1. Verificación de autenticación
  if (!token || !usuarioString) {
    return <Navigate to="/login" replace />;
  }

  // Intentar parsear el usuario con seguridad
  let usuario;
  try {
    usuario = JSON.parse(usuarioString);
  } catch (error) {
    // Si el JSON está mal formado, limpiamos y mandamos a login
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }

  const rolUsuario = usuario.rol;

  // 2. Verificación de autorización (Roles)
  if (!allowedRoles.includes(rolUsuario)) {
    // Si tiene un rol pero no está permitido en esta ruta específica,
    // lo mandamos a su dashboard principal. No hace falta el if/else gigante.
    return <Navigate to="/dashboard" replace />;
  }

  // 3. Si todo está bien, renderiza la ruta hija
  return <Outlet />;
};

export default ProtectedRoute;