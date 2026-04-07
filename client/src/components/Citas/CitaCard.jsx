import React from 'react';

const CitaCard = ({ cita, onCancelar }) => {
    // Formateo de fecha según normas locales
    const fechaFormateada = new Date(cita.fecha).toLocaleDateString('es-MX', {
        weekday: 'long', day: 'numeric', month: 'long'
    });

    // Lógica para los colores de la etiqueta (badge) según el estado
    let badgeBgColor = '#fff3cd';
    let badgeTextColor = '#856404';
    let borderColor = '#f1c40f'; // Amarillo por defecto

    if (cita.estado === 'confirmada') {
        badgeBgColor = '#d4edda';
        badgeTextColor = '#155724';
        borderColor = '#2ecc71'; // Verde
    } else if (cita.estado === 'cancelada') {
        badgeBgColor = '#f8d7da';
        badgeTextColor = '#721c24';
        borderColor = '#e74c3c'; // Rojo
    }

    const badgeStyle = {
        padding: '5px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 'bold',
        backgroundColor: badgeBgColor,
        color: badgeTextColor,
        textAlign: 'center'
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px',
            marginBottom: '15px',
            borderRadius: '12px',
            backgroundColor: '#fff',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            borderLeft: `6px solid ${borderColor}`
        }}>
            <div>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>Psic. {cita.nombre_psicologo} {cita.apellido_psicologo}</h3>
                <p style={{ margin: 0, color: '#666', textTransform: 'capitalize' }}>🗓️ {fechaFormateada}</p>
                <p style={{ margin: '5px 0 0 0', fontWeight: 'bold', color: '#333' }}>⏰ {cita.hora.slice(0, 5)} hrs</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                <span style={badgeStyle}>{cita.estado.toUpperCase()}</span>
                
                {/* El botón solo se muestra si la cita está confirmada */}
                {cita.estado === 'confirmada' && (
                    <button 
                        onClick={() => onCancelar(cita.id)}
                        style={{
                            padding: '6px 12px',
                            backgroundColor: '#e74c3c',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#c0392b'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#e74c3c'}
                    >
                        Cancelar
                    </button>
                )}
            </div>
        </div>
    );
};

export default CitaCard;