    import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PublicRoute = () => {
    const token = localStorage.getItem('token');
    const usuarioString = localStorage.getItem('usuario');

    // Si existe token y usuario, lo mandamos al dashboard directamente
    if (token && usuarioString) {
        return <Navigate to="/dashboard" replace />;
    }

    // Si no hay sesión, permitimos que vea el Login/Register
    return <Outlet />;
};

export default PublicRoute;