import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../Horarios/GestionHorarios.css';
import Swal from 'sweetalert2';

const SeleccionarCita = ({ psicologoId, nombrePsicologo }) => {
    const [fecha, setFecha] = useState(new Date());
    const [horasDisponibles, setHorasDisponibles] = useState([]);
    const [horaSeleccionada, setHoraSeleccionada] = useState(null);
    const [fechasDisponibles, setFechasDisponibles] = useState([]);
    const [cargando, setCargando] = useState(false);

    const pacienteStorage = localStorage.getItem('usuario');
    const paciente = pacienteStorage ? JSON.parse(pacienteStorage) : null;

    // ✅ FORMATEO LOCAL (SOLUCIONA BUG DE FECHAS)
    const formatearFechaLocal = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const fechaLabel = fecha.toLocaleDateString('es-MX', {
        weekday: 'long', day: 'numeric', month: 'long'
    });

    // 🔥 CARGAR FECHAS DISPONIBLES (para pintar calendario)
    useEffect(() => {
        const cargarFechas = async () => {
            if (!psicologoId) return;

            try {
                const res = await fetch(`${process.env.REACT_APP_API_URL}/citas/fechas/${psicologoId}`);
                if (res.ok) {
                    const data = await res.json();
                    setFechasDisponibles(data);
                }
            } catch (error) {
                console.error("Error al cargar fechas:", error);
            }
        };

        cargarFechas();
    }, [psicologoId]);

    // 🔥 CARGAR HORAS DEL DÍA
    useEffect(() => {
        const cargarDisponibilidad = async () => {
            if (!psicologoId) return;

            const fechaISO = formatearFechaLocal(fecha);

            try {
                const res = await fetch(`${process.env.REACT_APP_API_URL}/disponibilidad/${psicologoId}/${fechaISO}`);
                if (res.ok) {
                    const data = await res.json();
                    setHorasDisponibles(data);
                    setHoraSeleccionada(null);
                }
            } catch (error) {
                console.error("Error al cargar disponibilidad:", error);
            }
        };

        cargarDisponibilidad();
    }, [fecha, psicologoId]);

    // 🔥 VERIFICAR DISPONIBILIDAD PARA PINTAR DÍA
    const tieneDisponibilidad = (date) => {
        const fechaLocal = formatearFechaLocal(date);
        return fechasDisponibles.includes(fechaLocal);
    };

    const agendarCita = async () => {
        if (!horaSeleccionada) return;

        if (!paciente) {
            Swal.fire({
                icon: 'warning',
                title: 'Sesión requerida',
                text: 'Debes iniciar sesión como paciente para agendar una cita.',
                confirmButtonColor: '#60A6BF',
                scrollbarPadding: false
            });
            return;
        }

        const confirmacion = await Swal.fire({
            title: '¿Confirmar cita?',
            html: `
                <p>
                    <strong>${nombrePsicologo}</strong><br/>
                    ${fechaLabel} a las <strong>${horaSeleccionada}</strong>
                </p>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, confirmar',
            confirmButtonColor: '#3a7d8c',
            cancelButtonColor: 'rgb(177, 78, 78)',
            cancelButtonText: 'Cancelar',
            scrollbarPadding: false
        });

        if (!confirmacion.isConfirmed) return;

        setCargando(true);

        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/disponibilidad/reservar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pacienteId: paciente.id,
                    psicologoId,
                    fecha: formatearFechaLocal(fecha),
                    hora: horaSeleccionada
                })
            });

            if (res.ok) {
                setHorasDisponibles(prev => prev.filter(h => h !== horaSeleccionada));
                setHoraSeleccionada(null);

                Swal.fire({
                    icon: 'success',
                    title: '¡Cita confirmada!',
                    confirmButtonColor: '#3a7d8c',
                    timer: 3000,
                    scrollbarPadding: false
                });
            }

        } catch (error) {
            console.error(error);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="agendar-cita-container">

            <div className="disp-header">
                <h2>Agendar Cita</h2>
                <p className="disp-subheader">
                    Especialista: <strong>{nombrePsicologo}</strong>
                </p>
                <div style={{margin:'10px'}}><span style={{background:'#4CAF50', width:'15px', height:'15px', display:'inline-block'}}></span> Disponibilidad</div>
                <div className="disp-divider"></div>
            </div>

            <div className="agendar-layout">

                <div className="disp-calendar-section">
                    <span className="disp-section-label">Elige tu fecha</span>

                    <Calendar
                        onChange={(d) => setFecha(d)}
                        value={fecha}
                        minDate={new Date()}
                        locale="es-MX"
                        tileClassName={({ date, view }) => {
                            if (view === 'month' && tieneDisponibilidad(date)) {
                                return 'dia-disponible';
                            }
                        }}
                    />
                </div>

                <div className="disp-horas-section">
                    <span className="disp-section-label">Horarios disponibles</span>

                    <div className="disp-fecha-badge">
                        🗓 {fechaLabel}
                    </div>

                    {horasDisponibles.length > 0 ? (
                        <div className="horas-container">
                            {horasDisponibles.map(hora => (
                                <button
                                    key={hora}
                                    className={`hora-disponible ${horaSeleccionada === hora ? "seleccionada" : ""}`}
                                    onClick={() => setHoraSeleccionada(hora)}
                                >
                                    {hora}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="horas-vacio">
                            Sin turnos disponibles para este día.
                        </div>
                    )}

                    <p className="horas-hint">Selecciona una hora para continuar</p>
                </div>
            </div>

            {horaSeleccionada && (
                <div className="confirmacion-box">
                    <p>
                        Reserva con <strong>{nombrePsicologo}</strong><br />
                        el {fechaLabel} a las <strong>{horaSeleccionada}</strong>
                    </p>

                    <button
                        className="btn-confirmar"
                        onClick={agendarCita}
                        disabled={cargando}
                    >
                        {cargando ? "Confirmando..." : "Confirmar cita"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default SeleccionarCita;