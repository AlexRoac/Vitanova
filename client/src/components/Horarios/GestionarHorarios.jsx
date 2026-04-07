import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const GestionarHorarios = () => {
    const [fecha, setFecha] = useState(new Date());
    const [horasSeleccionadas, setHorasSeleccionadas] = useState([]);
    const [mensaje, setMensaje] = useState("");

    // 1. AJUSTE FINAL SEGÚN TU LOCALSTORAGE:
    // La llave es 'usuario' y el campo es 'id'
    const userStorage = localStorage.getItem('usuario'); 
    const user = userStorage ? JSON.parse(userStorage) : null;
    const psicologoId = user ? user.id : null; 

    const horasDelDia = [
        "08:00", "09:00", "10:00", "11:00", "12:00", 
        "13:00", "14:00", "15:00", "16:00", "17:00"
    ];

    useEffect(() => {
        const obtenerHorarios = async () => {
            if (!psicologoId) return;

            const fechaISO = fecha.toISOString().split('T')[0];
            try {
                const res = await fetch(`${process.env.REACT_APP_API_URL}/disponibilidad/${psicologoId}/${fechaISO}`);
                if (res.ok) {
                    const horasGuardadas = await res.json();
                    setHorasSeleccionadas(horasGuardadas);
                    setMensaje(""); 
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
            setMensaje("❌ Error: Sesión no encontrada.");
            return;
        }

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
                setMensaje("✅ ¡Horarios actualizados con éxito!");
            } else {
                setMensaje("❌ Hubo un error al guardar.");
            }
        } catch (error) {
            setMensaje("❌ Error de conexión.");
        }
    };

    // Si no hay usuario detectado, mostramos este aviso
    if (!user) {
        return <div style={{ textAlign: 'center', padding: '50px' }}><h3>Cargando sesión...</h3></div>;
    }

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
            <h2>Mi Disponibilidad</h2>
            {/* Mostramos el nombre y apellido que vimos en tu captura */}
            <p>Gestiona tus horas para el psicólogo: <strong>{user.nombre} {user.apellido}</strong></p>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <Calendar onChange={setFecha} value={fecha} minDate={new Date()} />
            </div>

            <h3>Horarios para el {fecha.toLocaleDateString()}:</h3>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
                {horasDelDia.map(hora => (
                    <label 
                        key={hora} 
                        style={{
                            padding: '10px', 
                            border: '1px solid #ccc', 
                            borderRadius: '5px',
                            backgroundColor: horasSeleccionadas.includes(hora) ? '#4CAF50' : '#f9f9f9',
                            color: horasSeleccionadas.includes(hora) ? 'white' : 'black',
                            cursor: 'pointer'
                        }}
                    >
                        <input 
                            type="checkbox" 
                            style={{ display: 'none' }} 
                            checked={horasSeleccionadas.includes(hora)} 
                            onChange={() => toggleHora(hora)} 
                        />
                        {hora}
                    </label>
                ))}
            </div>

            <button 
                onClick={guardarHorarios}
                style={{ padding: '10px 20px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}
            >
                Guardar Horarios
            </button>

            {mensaje && <p style={{ marginTop: '15px', fontWeight: 'bold' }}>{mensaje}</p>}
        </div>
    );
};

export default GestionarHorarios;