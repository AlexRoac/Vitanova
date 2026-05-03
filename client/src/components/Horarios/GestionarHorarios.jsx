import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './GestionHorarios.css';
import Swal from 'sweetalert2';

const GestionarHorarios = () => {
    const [fecha, setFecha] = useState(new Date());
    const [horasSeleccionadas, setHorasSeleccionadas] = useState([]);

    const userStorage = localStorage.getItem('usuario');
    const user = userStorage ? JSON.parse(userStorage) : null;
    const psicologoId = user ? user.id : null;

    const horasDelDia = [
        "08:00", "09:00", "10:00", "11:00", "12:00",
        "13:00", "14:00", "15:00", "16:00", "17:00"
    ];

    const fechaLabel = fecha.toLocaleDateString('es-MX', {
        weekday: 'long', day: 'numeric', month: 'long'
    });

    useEffect(() => {
        const obtenerHorarios = async () => {
            if (!psicologoId) return;
            const fechaISO = fecha.toISOString().split('T')[0];
            try {
                const res = await fetch(`${process.env.REACT_APP_API_URL}/disponibilidad/${psicologoId}/${fechaISO}`);
                if (res.ok) {
                    const horasGuardadas = await res.json();
                    setHorasSeleccionadas(horasGuardadas);
                }
            } catch (error) {
                console.error("Error al cargar horarios:", error);
            }
        };
        obtenerHorarios();
    }, [fecha, psicologoId]);

    const toggleHora = (hora) => {
        if (horasSeleccionadas.includes(hora)) {
            setHorasSeleccionadas(horasSeleccionadas.filter(h => h !== hora));
        } else {
            setHorasSeleccionadas([...horasSeleccionadas, hora]);
        }
    };

    const guardarHorarios = async () => {
        if (!psicologoId) {
            Swal.fire({
                icon: 'warning',
                title: 'Sesión no encontrada',
                text: 'No se detectó tu sesión. Por favor inicia sesión nuevamente.',
                confirmButtonColor: '#3a7d8c',
                confirmButtonText: 'Entendido'
            });
            return;
        }

        // Alerta de confirmación antes de guardar
        const confirmacion = await Swal.fire({
            title: '¿Guardar horarios?',
            html: `
                <p style="color:#4a6070; margin:0; font-size:0.92rem; line-height:1.7">
                    Se guardarán <strong style="color:#202343">${horasSeleccionadas.length} hora${horasSeleccionadas.length !== 1 ? 's' : ''}</strong>
                    para el <strong style="color:#202343">${fechaLabel}</strong>.
                    ${horasSeleccionadas.length === 0 ? '<br/><span style="color:#c0392b">Se eliminará toda la disponibilidad de este día.</span>' : ''}
                </p>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3a7d8c',
            cancelButtonColor: 'rgb(177, 78, 78)',
            confirmButtonText: 'Sí, guardar',
            cancelButtonText: 'Cancelar'
        });

        if (!confirmacion.isConfirmed) return;

        const fechaISO = fecha.toISOString().split('T')[0];
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/disponibilidad/configurar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    psicologoId,
                    fecha: fechaISO,
                    horas: horasSeleccionadas
                })
            });

            if (res.ok) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Horarios guardados!',
                    html: `
                        <p style="color:#4a6070; font-size:0.92rem; line-height:1.7">
                            Tu disponibilidad para el<br/>
                            <strong style="color:#202343">${fechaLabel}</strong><br/>
                            ha sido actualizada con éxito.
                        </p>
                    `,
                    confirmButtonColor: '#3a7d8c',
                    confirmButtonText: '¡Listo!',
                    timer: 4000,
                    timerProgressBar: true
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al guardar',
                    text: 'No se pudieron guardar los horarios. Intenta de nuevo.',
                    confirmButtonColor: '#3a7d8c',
                    confirmButtonText: 'Intentar de nuevo'
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error de conexión',
                text: 'No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.',
                confirmButtonColor: '#3a7d8c',
                confirmButtonText: 'Cerrar'
            });
        }
    };

    if (!user) {
        return (
            <div className="disp-loading">
                <div className="disp-loading-spinner"></div>
                <span>Cargando sesión...</span>
            </div>
        );
    }

    return (
        <div className="disponibilidad-container">

            <div className="disp-header">
                <h2>Mi Disponibilidad</h2>
                <p className="disp-subheader">
                    Psicólogo: <strong>{user.nombre} {user.apellido}</strong>
                </p>
                <div className="disp-divider"></div>
            </div>

            <div className="disp-layout">

                <div className="disp-calendar-section">
                    <span className="disp-section-label">Selecciona una fecha</span>
                    <Calendar
                        onChange={(d) => setFecha(d)}
                        value={fecha}
                        minDate={new Date()}
                        locale="es-MX"
                    />
                </div>

                <div className="disp-horas-section">
                    <span className="disp-section-label">Horarios disponibles</span>
                    <div className="disp-fecha-badge">
                        🗓 {fechaLabel}
                    </div>

                    <div className="horas-container">
                        {horasDelDia.map(hora => (
                            <label
                                key={hora}
                                className={`hora-item ${horasSeleccionadas.includes(hora) ? "activo" : ""}`}
                            >
                                <input
                                    type="checkbox"
                                    checked={horasSeleccionadas.includes(hora)}
                                    onChange={() => toggleHora(hora)}
                                />
                                {hora}
                            </label>
                        ))}
                    </div>

                    {horasSeleccionadas.length > 0 && (
                        <p className="horas-counter">
                            {horasSeleccionadas.length} hora{horasSeleccionadas.length !== 1 ? 's' : ''} seleccionada{horasSeleccionadas.length !== 1 ? 's' : ''}
                        </p>
                    )}

                    <p className="horas-hint">Toca una hora para activarla o desactivarla</p>
                </div>
            </div>

            <div className="btn-guardar-wrapper">
                <button className="btn-guardar" onClick={guardarHorarios}>
                    Guardar Horarios
                </button>
            </div>

        </div>
    );
};

export default GestionarHorarios;
