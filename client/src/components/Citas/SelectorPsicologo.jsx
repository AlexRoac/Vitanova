import React, { useState, useEffect } from 'react';

const SelectorPsicologo = ({ alSeleccionar }) => {
    const [psicologos, setPsicologos] = useState([]);

    useEffect(() => {
        const cargarData = async () => {
            try {
                // Asegúrate de que REACT_APP_API_URL en tu .env termine en /api
                // O escríbelo directo para probar: "http://localhost:5000/api/psicologos"
                const res = await fetch(`${process.env.REACT_APP_API_URL}/psicologos`);
                
                if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
                
                const data = await res.json();
                setPsicologos(data);
            } catch (err) {
                console.error("Error cargando psicólogos:", err);
            }
        };
        cargarData();
    }, []);

    return (
        <div style={{ marginBottom: '30px', textAlign: 'center' }}>
            <select 
                onChange={(e) => {
                    const id = parseInt(e.target.value);
                    const p = psicologos.find(ps => ps.id_usuario === id);
                    alSeleccionar(p);
                }}
                style={{ padding: '10px', borderRadius: '8px', width: '100%', maxWidth: '300px' }}
            >
                <option value="">-- Elige un especialista --</option>
                {psicologos.map(p => (
                    <option key={p.id_usuario} value={p.id_usuario}>
                        {p.nombre} {p.apellido}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default SelectorPsicologo;