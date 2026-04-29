import React, { useState } from 'react';
import '../loginform/loginform.css'; 
import { Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { default as logoV4 } from "../../assets/Logo_Vita4.png";
import Swal from 'sweetalert2';

function RegisterForm({ step, formData, handleChange, nextStep, prevStep, handleSubmit, onGoogleSuccess, onGoogleError  }) {

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [confirmPassword, setConfirmPassword] = useState('');

  const today = new Date().toISOString().split("T")[0];

  const handleNext = (e) => {
    e.preventDefault();
    if (formData.password !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Error de acceso",
        text: "Contraseña no coincide",
        confirmButtonColor: "#37b0d5",
                    });
      return;
    }
    nextStep();
  };

  return (
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: step === 2 ? '600px' : '400px' }}>
        
        {step === 1 && (
          <>
            <a href="/inicio">
              <img src={logoV4} alt="Logo V4" className="logoBV4" />
            </a>
            <h1>Crear cuenta</h1>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
              <GoogleLogin
                onSuccess={onGoogleSuccess}
                onError={onGoogleError}
                width="100%"
                text="signup_with"
                shape="circle"
              />
            </div>

            <div className="divider">
              <span></span><small>o</small><span></span>
            </div>

            <form className="login-form" onSubmit={handleNext}>
              <label>Correo electrónico</label>
              <input
                type="email" name="email" placeholder='correo@ejemplo.com'
                value={formData.email} onChange={handleChange}
                required
              />

              <label>Contraseña</label>
              <div className="password-container">
                <input
                  type={showPassword ? 'text' : 'password'} name="password" placeholder='password'
                  value={formData.password} onChange={handleChange}
                  required
                />
                <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>

              <label>Confirmar contraseña</label>
              <div className="password-container">
                <input
                  placeholder='confirm password'
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button type="button" className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>

              <button type="submit" className="submit-btn">Crear cuenta</button>
            </form>

            <p className="register">
              ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link>
            </p>
          </>
        )}

        {step === 2 && (
          <>
            <h1>Formulario de Perfil</h1>
            <form className="login-form profile-form" onSubmit={handleSubmit}>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label>Nombre</label>
                  <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Apellido</label>
                  <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} required />
                </div>
              </div>

              <label>Teléfono</label>
              <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} required />

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label>Fecha de nacimiento</label>
                  <input type="date" name="fecha_nacimiento" min="1900-12-31" max={today} value={formData.fecha_nacimiento} onChange={handleChange} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Ocupación</label>
                  <input type="text" name="ocupacion" value={formData.ocupacion} onChange={handleChange} placeholder="Ej. Estudiante, Ingeniero..." />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label>Género (Opcional)</label>
                  <select name="genero" value={formData.genero} onChange={handleChange} className="select-box">
                    <option value="">Selecciona tu género</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label>Estado civil</label>
                  <select name="estado_civil" value={formData.estado_civil} onChange={handleChange} className="select-box">
                    <option value="">Selecciona</option>
                    <option value="Soltero/a">Soltero/a</option>
                    <option value="Casado/a">Casado/a</option>
                    <option value="Divorciado/a">Divorciado/a</option>
                    <option value="Viudo/a">Viudo/a</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginTop: '20px' }}>
                <button type="button" className="submit-btn" onClick={prevStep}>
                  Regresar
                </button>
                <button type="submit" className="submit-btn">
                  Enviar
                </button>
              </div>
            </form>
          </>
        )}

      </div>
    </div>
  );
}

export default RegisterForm;