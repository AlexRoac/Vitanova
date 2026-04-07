import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const SeleccionarCita = ({ psicologoId, nombrePsicologo }) => {
    const [fecha, setFecha] = useState(new Date());
    const [horasDisponibles, setHorasDisponibles] = useState([]);
    const [horaSeleccionada, setHoraSeleccionada] = useState(null);
    const [mensaje, setMensaje] = useState("");

    // 1. Obtener los datos del paciente desde 'usuario' como vimos en tu Application Storage
    const pacienteStorage = localStorage.getItem('usuario');
    const paciente = pacienteStorage ? JSON.parse(pacienteStorage) : null;

    useEffect(() => {
        const cargarDisponibilidad = async () => {
            if (!psicologoId) return;
            
            const fechaISO = fecha.toISOString().split('T')[0];
            try {
                // GET a /api/disponibilidad/:id/:fecha
                const res = await fetch(`${process.env.REACT_APP_API_URL}/disponibilidad/${psicologoId}/${fechaISO}`);
                if (res.ok) {
                    const data = await res.json();
                    setHorasDisponibles(data); 
                    setHoraSeleccionada(null);
                    setMensaje("");
                }
            } catch (error) {
                console.error("Error al cargar disponibilidad:", error);
            }
        };
        cargarDisponibilidad();
    }, [fecha, psicologoId]);

    const agendarCita = async () => {
        if (!horaSeleccionada) {
            alert("Por favor, selecciona una hora.");
            return;
        }

        if (!paciente) {
            setMensaje("❌ Error: Debes iniciar sesión como paciente.");
            return;
        }

        try {
            // CORRECCIÓN DE RUTA: 
            // Tu server.js usa /api/disponibilidad
            // Tu disponibilidad.js tiene la ruta /reservar
            const res = await fetch(`${process.env.REACT_APP_API_URL}/disponibilidad/reservar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pacienteId: paciente.id, // Usamos 'id' que es lo que hay en tu storage
                    psicologoId: psicologoId,
                    fecha: fecha.toISOString().split('T')[0],
                    hora: horaSeleccionada
                })
            });

            const data = await res.json();

            if (res.ok) {
                setMensaje("✅ ¡Cita agendada con éxito!");
                // Quitamos la hora de la lista para que no se pueda volver a elegir
                setHorasDisponibles(horasDisponibles.filter(h => h !== horaSeleccionada));
                setHoraSeleccionada(null);
            } else {
                setMensaje(`❌ ${data.error || "No se pudo agendar la cita."}`);
            }
        } catch (error) {
            console.error("Error en la reserva:", error);
            setMensaje("❌ Error de conexión con el servidor.");
        }
    };

    return (
        <div style={{ textAlign: 'center', padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ color: '#333' }}>Agendar Cita</h2>
            <p>Psicólogo: <strong>{nombrePsicologo}</strong></p>
            
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <Calendar 
                    onChange={setFecha} 
                    value={fecha} 
                    minDate={new Date()} 
                />
            </div>

            <h3>Horarios disponibles para el {fecha.toLocaleDateString()}:</h3>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginTop: '15px' }}>
                {horasDisponibles.length > 0 ? (
                    horasDisponibles.map(hora => (
                        <button
                            key={hora}
                            onClick={() => setHoraSeleccionada(hora)}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '8px',
                                border: '2px solid #007BFF',
                                backgroundColor: horaSeleccionada === hora ? '#007BFF' : 'white',
                                color: horaSeleccionada === hora ? 'white' : '#007BFF',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                transition: '0.3s'
                            }}
                        >
                            {hora}
                        </button>
                    ))
                ) : (
                    <p style={{ color: '#666', fontStyle: 'italic' }}>No hay turnos libres para este día.</p>
                )}
            </div>

            {horaSeleccionada && (
                <div style={{ marginTop: '30px', padding: '20px', border: '1px dashed #28a745', borderRadius: '10px' }}>
                    <p>Vas a reservar a las <strong>{horaSeleccionada}</strong></p>
                    <button 
                        onClick={agendarCita}
                        style={{ 
                            padding: '12px 30px', 
                            backgroundColor: '#28a745', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '5px', 
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold'
                        }}
                    >
                        Confirmar Cita
                    </button>
                </div>
            )}

            {mensaje && (
                <p style={{ 
                    marginTop: '20px', 
                    padding: '10px', 
                    borderRadius: '5px',
                    backgroundColor: mensaje.includes('✅') ? '#d4edda' : '#f8d7da',
                    color: mensaje.includes('✅') ? '#155724' : '#721c24'
                }}>
                    {mensaje}
                </p>
            )}
        </div>
    );
};

export default SeleccionarCita;