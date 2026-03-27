import React from 'react';
import './CompletarPerfilForm.css'; 

function CompletarPerfilForm({ formData, onChange, onSubmit }) {
  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Completar Perfil</h1>
        <p style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>
          Solo necesitamos unos datos más para terminar de configurar tu cuenta.
        </p>

        <form className="login-form" onSubmit={onSubmit}>
          
          <label htmlFor="telefono">Teléfono</label>
          <input
            type="tel"
            id="telefono"
            name="telefono"
            placeholder="1234567890"
            value={formData.telefono}
            onChange={onChange}
            required
          />

          <label htmlFor="fecha_nacimiento">Fecha de Nacimiento</label>
          <input
            type="date"
            id="fecha_nacimiento"
            name="fecha_nacimiento"
            value={formData.fecha_nacimiento}
            onChange={onChange}
            required
          />

          <label htmlFor="ocupacion">Ocupación</label>
          <input
            type="text"
            id="ocupacion"
            name="ocupacion"
            placeholder="Ej. Estudiante, Ingeniero..."
            value={formData.ocupacion}
            onChange={onChange}
            required
          />

          <label htmlFor="genero">Género</label>
          <select 
            id="genero" 
            name="genero" 
            value={formData.genero} 
            onChange={onChange} 
            required
            style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ccc', backgroundColor: '#fff' }}
          >
            <option value="">Selecciona tu género</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
            <option value="Otro">Otro</option>
          </select>

          <label htmlFor="estado_civil">Estado Civil</label>
          <select 
            id="estado_civil" 
            name="estado_civil" 
            value={formData.estado_civil} 
            onChange={onChange} 
            required
            style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ccc', backgroundColor: '#fff' }}
          >
            <option value="">Selecciona tu estado civil</option>
            <option value="Soltero/a">Soltero/a</option>
            <option value="Casado/a">Casado/a</option>
            <option value="Divorciado/a">Divorciado/a</option>
            <option value="Viudo/a">Viudo/a</option>
          </select>

          <button type="submit" className="submit-btn" style={{ marginTop: '10px' }}>
            Guardar y Continuar
          </button>

        </form>
      </div>
    </div>
  );
}

export default CompletarPerfilForm;