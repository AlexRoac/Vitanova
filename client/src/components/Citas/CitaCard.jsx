import React, { useState, useEffect } from 'react';
import './CitaCard.css';

const CitaCard = ({ cita, onCancelar }) => {

    const [usuario, setUsuario] = useState(null);

    useEffect(() => {
        const usuarioGuardado = localStorage.getItem("usuario");
        if (usuarioGuardado) {
            setUsuario(JSON.parse(usuarioGuardado));
        }
    }, []);

    if (!usuario) return null;

    const fechaFormateada = new Date(cita.fecha).toLocaleDateString('es-MX', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });

    // Clase dinámica según estado
    const estadoClase = {
        confirmada: "confirmada",
        cancelada: "cancelada",
        pendiente: "pendiente"
    }[cita.estado] || "pendiente";

    return (
        <div className={`cita-card ${estadoClase}`}>
            
            <div className="cita-info">
                {usuario.rol === 'psicologo' ? (
                    <h3>
                        Paciente: {cita.nombre_paciente} {cita.apellido_paciente}
                    </h3>
                ) : (
                    <h3>
                        Psic. {cita.nombre_psicologo} {cita.apellido_psicologo}
                    </h3>
                )}

                <p className="fecha">🗓️ {fechaFormateada}</p>
                <p className="hora">⏰ {cita.hora?.slice(0, 5)} hrs</p>
            </div>

            <div className="cita-actions">
                <span className={`badge ${estadoClase}`}>
                    {cita.estado.toUpperCase()}
                </span>

                {cita.estado === 'confirmada' && (
                    <button 
                        className="btn-cancelar"
                        onClick={() => onCancelar(cita.id)}
                    >
                        Cancelar
                    </button>
                )}
            </div>

        </div>
    );
};

export default CitaCard;