import React, { useState, useEffect } from 'react';
import './Gestion.css';

function Gestion() {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);

  const API_URL = "http://localhost:5000/api"; 

  // OBTENER USUARIOS DE LA BASE DE DATOS
  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        const token = localStorage.getItem("token"); // Sacamos el token de la memoria
        
        const respuesta = await fetch(`${API_URL}/usuarios`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`, // Le mostramos la credencial al servidor
            'Content-Type': 'application/json'
          }
        });

        if (respuesta.ok) {
          const datos = await respuesta.json();
          setUsuarios(datos); // Guardamos los usuarios reales en el estado
        } else {
          console.error("Error al obtener los usuarios");
        }
      } catch (error) {
        console.error("Error de conexión con el servidor:", error);
      }
    };

    cargarUsuarios();
  }, []); // [] significa que esto se ejecuta solo una vez al abrir la pagina

  const handleBusqueda = (e) => {
    setBusqueda(e.target.value);
  };

  const cambiarRol = (idUsuario, nuevoRol) => {
    const nuevosUsuarios = usuarios.map(user => {
      if (user.id === idUsuario) {
        return { ...user, rol: nuevoRol };
      }
      return user;
    });
    setUsuarios(nuevosUsuarios);
  };

  // ELIMINAR UN USUARIO EN LA BASE DE DATOS (DELETE)
  const eliminarUsuario = async (idUsuario) => {
    const confirmar = window.confirm("¿Estás seguro de que deseas eliminar este usuario?");
    
    if (confirmar) {
      try {
        const token = localStorage.getItem("token");
        
        // Le decimos al backend que ID queremos borrar
        const respuesta = await fetch(`${API_URL}/usuarios/${idUsuario}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (respuesta.ok) {
          // Si el servidor confirma que borra, elimina pantalla al user
          const listaActualizada = usuarios.filter(user => user.id !== idUsuario);
          setUsuarios(listaActualizada);
        } else {
          alert("Hubo un error al intentar eliminar el usuario.");
        }
      } catch (error) {
        console.error("Error al eliminar:", error);
      }
    }
  };


  // GUARDAR CAMBIOS DE ROLES EN LA BD 
  const aplicarCambios = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Enviamos TODO el arreglo de usuarios actualizados al backend
      const respuesta = await fetch(`${API_URL}/usuarios/actualizar-roles`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ usuarios: usuarios })
      });

      if (respuesta.ok) {
        setMostrarModal(true);
      } else {
        alert("Error al guardar los cambios en la base de datos.");
      }
    } catch (error) {
      console.error("Error al aplicar cambios:", error);
    }
  };

  const usuariosFiltrados = usuarios.filter(user => 
    user.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    user.email.toLowerCase().includes(busqueda.toLowerCase())
  );
    return (
        <div className="gestion-container">
        
        <div className="search-container">
            <input 
            type="text" 
            placeholder="🔍 Buscar" 
            value={busqueda}
            onChange={handleBusqueda}
            className="search-input"
            />
        </div>

        <div className="row">
            {usuariosFiltrados.map(user => (
            <div className="col-lg-6 col-md-12" key={user.id}>
                <div className="gestion-card">
                
                <button 
                    onClick={() => eliminarUsuario(user.id)}
                    className="delete-btn"
                    title="Eliminar usuario"
                >
                    ✖
                </button>

                <div className="avatar-icon">👤</div>
                
                <div className="user-info">
                    <h6 className="user-name">{user.nombre}</h6>
                    <a href={`mailto:${user.email}`} className="user-email">
                    {user.email}
                    </a>
                    
                    <select 
                    value={user.rol} 
                    onChange={(e) => cambiarRol(user.id, e.target.value)}
                    className="role-select"
                    >
                    <option value="1">Paciente</option>
                    <option value="2">Psicologo</option>
                    <option value="3">Admin</option>
                    </select>
                </div>

                </div>
            </div>
            ))}
        </div>

        <div className="btn-aplicar-container">
            <button onClick={aplicarCambios} className="btn-aplicar">
            Aplicar
            </button>
        </div>

        {mostrarModal && (
            <div className="modal-overlay">
            <div className="modal-content">
                <p className="modal-text">LOS CAMBIOS HAN SIDO APLICADOS</p>
                <button onClick={() => setMostrarModal(false)} className="btn-ok">
                Ok
                </button>
            </div>
            </div>
        )}

        </div>
    );
}

export default Gestion;