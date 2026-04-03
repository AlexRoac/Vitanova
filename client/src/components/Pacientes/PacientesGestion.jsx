import React, { useState, useEffect } from 'react';
import './Pacientes.css'; 

function PacienteGestion() {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  
  // Estados para manejar los modales
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [vistaModal, setVistaModal] = useState("detalle"); // Puede ser: "detalle", "nueva-nota", "notas-pasadas"
  
  // Estado para el formulario de la nota
  const [contenidoNota, setContenidoNota] = useState("");
  const [guardando, setGuardando] = useState(false);

  const [notasPasadas, setNotasPasadas] = useState([]);
  const [cargandoNotas, setCargandoNotas] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api"; 

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

  const abrirModalPaciente = (paciente) => {
    setPacienteSeleccionado(paciente);
    setVistaModal("detalle"); // Siempre que abrimos, empezamos en el detalle
    setContenidoNota(""); // Limpiamos el campo por si había algo escrito antes
  };

  const cerrarModal = () => {
    setPacienteSeleccionado(null);
  };

  // --- FUNCIÓN PARA GUARDAR LA NOTA ---
  const guardarNuevaNota = async () => {
    if (!contenidoNota.trim()) {
      alert("La nota no puede estar vacía.");
      return;
    }

    setGuardando(true);

    try {
      const token = localStorage.getItem("token");
      
      const respuesta = await fetch(`${API_URL}/notas`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          // Mandamos el id_usuario basándonos en tu base de datos
          paciente_id: pacienteSeleccionado.id, 
          contenido: contenidoNota
        })
      });

      if (respuesta.ok) {
        alert("¡Nota guardada exitosamente!");
        setContenidoNota(""); // Limpiamos el área de texto
        setVistaModal("detalle"); // Regresamos a la vista principal del paciente
      } else {
        alert("Hubo un error al guardar la nota.");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("Error de conexión con el servidor.");
    } finally {
      setGuardando(false);
    }
  };

  // --- FUNCIÓN PARA CARGAR NOTAS PASADAS ---
  const cargarNotasPasadas = async (idPaciente) => {
    setCargandoNotas(true);
    try {
      const token = localStorage.getItem("token");
      const respuesta = await fetch(`${API_URL}/notas/${idPaciente}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (respuesta.ok) {
        const datos = await respuesta.json();
        setNotasPasadas(datos);
      } else {
        console.error("Error al obtener las notas");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
    } finally {
      setCargandoNotas(false);
    }
  };
  const usuariosFiltrados = usuarios.filter(user => {
    const esPaciente = String(user.rol) === "1" || String(user.id_rol) === "1"; // Ajustado por si usas id_rol
    const coincideBusqueda = user.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
                             user.email?.toLowerCase().includes(busqueda.toLowerCase());
    
    return esPaciente && coincideBusqueda; 
  });

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
        {usuariosFiltrados.length > 0 ? (
          usuariosFiltrados.map(user => (
            <div className="col-lg-6 col-md-12" key={user.id_usuario || user.id}>
              <div className="gestion-card">
                
                <div className="avatar-icon">
                  <svg width="45" height="45" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"/>
                  </svg>
                </div>
                
                <div className="user-info">
                  <h6 className="user-name">{user.nombre}</h6>
                  <a href={`mailto:${user.email}`} className="user-email">{user.email}</a>
                  <p className="user-phone">{user.telefono || "8335895555"}</p>
                  
                  <button onClick={() => abrirModalPaciente(user)} className="ver-mas-btn">
                    VER MÁS
                  </button>
                </div>

              </div>
            </div>
          ))
        ) : (
          <p style={{ textAlign: "center", width: "100%", marginTop: "20px" }}>
            No se encontraron pacientes.
          </p>
        )}
      </div>

      {/* --- MODAL PRINCIPAL --- */}
      {pacienteSeleccionado && (
        <div className="modal-overlay-detalle">
          <div className="modal-content-detalle">
            
            {/* VISTA 1: DETALLE DEL PACIENTE (La que hicimos antes) */}
            {vistaModal === "detalle" && (
              <>
                <div className="detalle-avatar">
                    <div className="detalle-icon-bg">
                        <svg width="60" height="60" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"/>
                        </svg>
                    </div>
                </div>

                <div className="detalle-info">
                    <p className="detalle-nombre">{pacienteSeleccionado.nombre} {pacienteSeleccionado.apellido}</p>
                    <p className="detalle-numero">{pacienteSeleccionado.telefono || "8335895555"}</p>
                    <a href={`mailto:${pacienteSeleccionado.email}`} className="detalle-email">
                        {pacienteSeleccionado.email}
                    </a>

                    <div className="detalle-datos-extra">
                        <p><span>Fecha de nacimiento</span><br/>{pacienteSeleccionado.fecha_nacimiento ? new Date(pacienteSeleccionado.fecha_nacimiento).toLocaleDateString() : "xx/xx/xxxx"}</p>
                        <p><span>Género</span><br/>{pacienteSeleccionado.genero || "No especificado"}</p>
                        <p><span>Última cita</span><br/>{pacienteSeleccionado.ultima_cita || "xx/xx/xxxx"}</p>
                        <p><span>Próxima cita</span><br/>{pacienteSeleccionado.proxima_cita || "Sin definir"}</p>
                    </div>
                </div>

                <div className="detalle-botones">
                    <button className="btn-nota-pasada" onClick={() => { setVistaModal("notas-pasadas"); cargarNotasPasadas(pacienteSeleccionado.id); }}>Notas Pasadas</button>
                    <button className="btn-nueva-nota" onClick={() => setVistaModal("nueva-nota")}>Nueva Nota</button>
                </div>

                <button onClick={cerrarModal} className="btn-regresar">Cerrar</button>
              </>
            )}

            {/* VISTA 2: FORMULARIO DE NUEVA NOTA */}
            {vistaModal === "nueva-nota" && (
              <div className="nueva-nota-container">
                <h3 className="titulo-nota">Nueva Nota para {pacienteSeleccionado.nombre}</h3>
                <p className="subtitulo-nota">Escribe las observaciones de la sesión actual.</p>
                
                <textarea 
                  className="textarea-nota" 
                  placeholder="El paciente reporta que..."
                  value={contenidoNota}
                  onChange={(e) => setContenidoNota(e.target.value)}
                  disabled={guardando}
                ></textarea>

                <div className="botones-accion-nota">
                  <button 
                    className="btn-cancelar-nota" 
                    onClick={() => setVistaModal("detalle")}
                    disabled={guardando}
                  >
                    Cancelar
                  </button>
                  <button 
                    className="btn-guardar-nota" 
                    onClick={guardarNuevaNota}
                    disabled={guardando}
                  >
                    {guardando ? "Guardando..." : "Guardar Nota"}
                  </button>
                </div>
              </div>
            )}

            {/* VISTA 3: NOTAS PASADAS */}
            {vistaModal === "notas-pasadas" && (
              <div className="notas-pasadas-container">
                <h3 className="titulo-nota">Historial de {pacienteSeleccionado.nombre}</h3>
                
                <div className="lista-notas" style={{ maxHeight: '300px', overflowY: 'auto', marginTop: '15px' }}>
                  {cargandoNotas ? (
                    <p>Cargando notas...</p>
                  ) : notasPasadas.length > 0 ? (
                    notasPasadas.map(nota => (
                      <div key={nota.id} style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '10px', borderLeft: '4px solid #5d7b8a' }}>
                        <p style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '8px', fontWeight: 'bold' }}>
                          {new Date(nota.fecha_creacion).toLocaleDateString()} - Escrito por: {nota.nombre_psicologo || "Desconocido"} {nota.apellido_psicologo || ""}
                        </p>
                        <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{nota.contenido}</p>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: '#6c757d', fontStyle: 'italic' }}>Este paciente aún no tiene notas registradas.</p>
                  )}
                </div>
                
                <div className="botones-accion-nota" style={{ justifyContent: 'center', marginTop: '20px' }}>
                  <button className="btn-cancelar-nota" onClick={() => setVistaModal("detalle")}>
                    Regresar al Perfil
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

export default PacienteGestion;