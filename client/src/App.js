import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Inicio from './pages/Inicio';
import Dashboard from './pages/Dashboard';
import Gestion from './pages/Gestion';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Error404 from './components/Error404/error404';

import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/inicio" element={<Inicio />} />
        <Route path="*" element={<Error404 />} />

        <Route element={<ProtectedRoute allowedRoles={['paciente', 'psicologo', 'admin']} />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/gestion" element={<Gestion />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;