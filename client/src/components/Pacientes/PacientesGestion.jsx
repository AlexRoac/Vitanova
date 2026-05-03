import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2'; // <-- Importamos SweetAlert2
import './Pacientes.css'; 

function PacienteGestion() {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  
  // Estados para manejar los modales
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [vistaModal, setVistaModal] = useState("detalle"); 
  
  // Estado para el formulario de la nota
  const [contenidoNota, setContenidoNota] = useState("");
  const [guardando, setGuardando] = useState(false);

  const [notasPasadas, setNotasPasadas] = useState([]);
  const [cargandoNotas, setCargandoNotas] = useState(false);

  // NUEVO ESTADO: Para guardar las fechas calculadas
  const [fechasCitas, setFechasCitas] = useState({ ultima: "Calculando...", proxima: "Calculando..." });

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api"; 

  //Bloquear el scroll del modal


  //Salir con ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") cerrarModal();
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
    }, []);

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

  // --- NUEVA FUNCIÓN: CALCULAR ÚLTIMA Y PRÓXIMA CITA ---
  const calcularFechasCitas = async (idPaciente) => {
    try {
      const token = localStorage.getItem("token");
      // Llamamos al endpoint de historial que ya tenías
      const respuesta = await fetch(`${API_URL}/citas/paciente/${idPaciente}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (respuesta.ok) {
        const citas = await respuesta.json();
        const ahora = new Date();
        
        let ultima = null;
        let proxima = null;

        // Filtramos las canceladas
        const citasValidas = citas.filter(c => c.estado !== 'cancelada');

        citasValidas.forEach(cita => {
          // Unimos fecha y hora para poder compararla con la hora actual
          const fechaSolo = cita.fecha.split('T')[0]; 
          const fechaCita = new Date(`${fechaSolo}T${cita.hora}`);

          if (fechaCita < ahora) {
            // Si la cita ya pasó, buscamos la más reciente hacia atrás
            if (!ultima || fechaCita > ultima.objFecha) {
              ultima = { ...cita, objFecha: fechaCita };
            }
          } else if (fechaCita >= ahora && cita.estado === 'confirmada') {
            // Si la cita es en el futuro, buscamos la más cercana hacia adelante
            if (!proxima || fechaCita < proxima.objFecha) {
              proxima = { ...cita, objFecha: fechaCita };
            }
          }
        });

        // Actualizamos el estado con las fechas formateadas
        setFechasCitas({
          ultima: ultima ? ultima.objFecha.toLocaleDateString('es-MX') : "Sin citas previas",
          proxima: proxima ? `${proxima.objFecha.toLocaleDateString('es-MX')} a las ${proxima.hora.slice(0,5)} hrs` : "Sin agendar"
        });

      } else {
        setFechasCitas({ ultima: "Error al cargar", proxima: "Error al cargar" });
      }
    } catch (error) {
      console.error("Error al calcular fechas:", error);
      setFechasCitas({ ultima: "Error", proxima: "Error" });
    }
  };

  // --- MODIFICADO: ABRIR MODAL AHORA CALCULA LAS FECHAS ---
  const abrirModalPaciente = (paciente) => {
    const idReal = paciente.id_usuario || paciente.id;
    setPacienteSeleccionado(paciente);
    setVistaModal("detalle"); 
    setContenidoNota(""); 
    setFechasCitas({ ultima: "Calculando...", proxima: "Calculando..." }); // Reiniciamos el texto
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    // Disparamos el cálculo de las fechas
    calcularFechasCitas(idReal);
  };

  const cerrarModal = () => {
    setPacienteSeleccionado(null);
    document.body.style.overflow = "visible";
    document.documentElement.style.overflow = "visible";
  };

  const guardarNuevaNota = async () => {
    if (!contenidoNota.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Atención',
        text: 'La nota no puede estar vacía.',
        confirmButtonColor: '#60A6BF',
        scrollbarPadding: false
      });
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
          paciente_id: pacienteSeleccionado.id_usuario || pacienteSeleccionado.id, 
          contenido: contenidoNota
        })
      });

      if (respuesta.ok) {
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: '¡Nota guardada exitosamente!',
          timer: 2000,
          showConfirmButton: false,
          scrollbarPadding: false
        });
        setContenidoNota(""); 
        setVistaModal("detalle"); 
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un error al guardar la nota.',
          confirmButtonColor: '#60A6BF',
          scrollbarPadding: false
        });
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error de red',
        text: 'Error de conexión con el servidor.',
        confirmButtonColor: '#60A6BF',
        scrollbarPadding: false
      });
    } finally {
      setGuardando(false);
    }
  };

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
    const esPaciente = String(user.rol) === "1" || String(user.id_rol) === "1"; 
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
                  {user.email && user.email.length > 25 ? (
                    <a href={`mailto:${user.email}`} className="user-email" title={user.email}>
                      {user.email.slice(0, 22) + "..."}
                    </a>
                  ) : (
                    <a href={`mailto:${user.email}`} className="user-email">
                      {user.email}
                    </a>
                  )}
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
        <div className="modal-overlay-detalle" onClick={cerrarModal}>
          <div className="modal-content-detalle" onClick={(e)=>e.stopPropagation()}>
            <button onClick={cerrarModal} className="btn-regresar">X</button>
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
                        
                        {/* AQUI SE IMPRIMEN LAS FECHAS CALCULADAS DINÁMICAMENTE */}
                        <p><span>Última cita</span><br/>{fechasCitas.ultima}</p>
                        <p><span>Próxima cita</span><br/>{fechasCitas.proxima}</p>
                    </div>
                </div>

                <div className="detalle-botones">
                    <button className="btn-nota-pasada" onClick={() => { setVistaModal("notas-pasadas"); cargarNotasPasadas(pacienteSeleccionado.id_usuario || pacienteSeleccionado.id); }}>Notas Pasadas</button>
                    <button className="btn-nueva-nota" onClick={() => setVistaModal("nueva-nota")}>Nueva Nota</button>
                </div>
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