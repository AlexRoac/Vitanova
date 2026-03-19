import React from 'react'
import './loginform.css'

function LoginForm({ correo, password, showPassword, setShowPassword, onCorreoChange, onPasswordChange, onSubmit }) {
  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Iniciar sesión</h1>

        <button type="button" className="login-google">
          <span className="google-icon" aria-hidden="true">G  </span>
           Continuar con Google
        </button>

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
          ¿Todavía no te has registrado? <a href="/register">Crea una cuenta</a>
        </p>
      </div>
    </div>
  )
}

export default LoginForm;
