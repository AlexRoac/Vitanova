import React from 'react'
import './loginform.css'
import { Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { default as logoV4 } from "../../assets/Logo_Vita4.png";

function LoginForm({ correo, password, showPassword, setShowPassword, onCorreoChange, onPasswordChange, onSubmit, onGoogleSuccess, onGoogleError }) {
  return (
    <div className="login-page">
      <div className="login-card">
        <a href="/inicio">
          <img src={logoV4} alt="Logo V4" className="logoV4" />
        </a>
        <h1>Iniciar sesión</h1>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
          <GoogleLogin
            onSuccess={onGoogleSuccess}
            onError={onGoogleError}
            width="100%"
            shape="circle"
          />
        </div>

        <div className="divider">
          <span></span>
          <small>o</small>
          <span></span>
        </div>

        <form className="login-form" onSubmit={onSubmit}>
          <label htmlFor="email">Correo electrónico</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="correo@ejemplo.com"
            value={correo}
            onChange={onCorreoChange}
            required
          />

          <label htmlFor="password">Contraseña</label>
          <div className="password-container">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              placeholder="password"
              value={password}
              onChange={onPasswordChange}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>

          <label className="remember">
            <input type="checkbox" name="remember" /> Recordar contraseña
          </label>

          <button type="submit" className="submit-btn">
            Acceder
          </button>
        </form>

        <p className="register">
          ¿Todavía no te has registrado? <Link to="/register">Crea una cuenta</Link>
        </p>
      </div>
    </div>
  )
}

export default LoginForm;
