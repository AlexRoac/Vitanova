import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './Gestion.css';

function Gestion() {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api"; 

  // OBTENER USUARIOS DE LA BASE DE DATOS
  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        const token = localStorage.getItem("token");
        
        const respuesta = await fetch(`${API_URL}/usuarios`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (respuesta.ok) {
          const datos = await respuesta.json();
          setUsuarios(datos);
        } else {
          console.error("Error al obtener los usuarios");
        }
      } catch (error) {
        console.error("Error de conexión con el servidor:", error);
      }
    };

    cargarUsuarios();
  }, []);

  const handleBusqueda = (e) => {
    setBusqueda(e.target.value);
  };

  // CAMBIAR ROL EN EL ESTADO (CON VALIDACIÓN DE ADMIN)
  const cambiarRol = (idUsuario, nuevoRol) => {
    const usuarioAEditar = usuarios.find(u => u.id === idUsuario);

    // Validar que no se le quite el rol al último administrador (Asumiendo que el valor '3' es Admin)
    if (String(usuarioAEditar.rol) === "3" && String(nuevoRol) !== "3") {
      const cantidadAdmins = usuarios.filter(u => String(u.rol) === "3").length;
      
      if (cantidadAdmins <= 1) {
        Swal.fire({
          icon: 'error',
          title: 'Acción denegada',
          text: 'No puedes quitarle el rol al último Administrador del sistema.',
          confirmButtonColor: '#60A6BF'
        });
        return; // Cortamos la ejecución
      }
    }

    const nuevosUsuarios = usuarios.map(user => {
      if (user.id === idUsuario) {
        return { ...user, rol: nuevoRol };
      }
      return user;
    });
    setUsuarios(nuevosUsuarios);
  };

  // ELIMINAR UN USUARIO EN LA BASE DE DATOS (CON VALIDACIÓN Y SWEETALERT)
  const eliminarUsuario = async (idUsuario) => {
    const usuarioAEliminar = usuarios.find(u => u.id === idUsuario);

    // Validar que no se elimine al último administrador
    if (String(usuarioAEliminar.rol) === "3") {
      const cantidadAdmins = usuarios.filter(u => String(u.rol) === "3").length;
      
      if (cantidadAdmins <= 1) {
        Swal.fire({
          icon: 'error',
          title: 'Acción denegada',
          text: 'No puedes eliminar al último Administrador del sistema.',
          confirmButtonColor: '#60A6BF'
        });
        return; // Cortamos la ejecución
      }
    }

    // SweetAlert para confirmar eliminación
    const confirmacion = await Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esto. Se eliminará permanentemente al usuario.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#aab8c2',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    
    if (confirmacion.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        
        const respuesta = await fetch(`${API_URL}/usuarios/${idUsuario}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (respuesta.ok) {
          const datos = await respuesta.json();
          const listaActualizada = usuarios.filter(user => user.id !== idUsuario);
          setUsuarios(listaActualizada);
          
          const textoCitas = datos.citasCanceladas > 0
            ? ` Se cancelaron ${datos.citasCanceladas} cita(s) pendiente(s) y los pacientes fueron notificados.`
            : '';

          Swal.fire({
            icon: 'success',
            title: '¡Eliminado!',
            text: `El usuario ha sido eliminado correctamente.${textoCitas}`,
            timer: 3000,
            showConfirmButton: false
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Hubo un error al intentar eliminar el usuario.',
            confirmButtonColor: '#60A6BF'
          });
        }
      } catch (error) {
        console.error("Error al eliminar:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error de red',
          text: 'No se pudo conectar con el servidor.',
          confirmButtonColor: '#60A6BF'
        });
      }
    }
  };

  // GUARDAR CAMBIOS DE ROLES EN LA BD 
  const aplicarCambios = async () => {
    try {
      const token = localStorage.getItem("token");
      
      const respuesta = await fetch(`${API_URL}/usuarios/actualizar-roles`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ usuarios: usuarios })
      });

      if (respuesta.ok) {
        const datos = await respuesta.json();
        const textoCitas = datos.citasCanceladas > 0
          ? ` Se cancelaron ${datos.citasCanceladas} cita(s) de psicólogos que cambiaron de rol y los pacientes fueron notificados.`
          : '';

        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: `Los cambios han sido aplicados correctamente.${textoCitas}`,
          confirmButtonColor: '#60A6BF'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al guardar los cambios en la base de datos.',
          confirmButtonColor: '#60A6BF'
        });
      }
    } catch (error) {
      console.error("Error al aplicar cambios:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error de red',
        text: 'No se pudo establecer conexión con el servidor.',
        confirmButtonColor: '#60A6BF'
      });
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

    </div>
  );
}

export default Gestion;