import React, { useState, useEffect } from 'react';
import '../Horarios/GestionHorarios.css';

const SelectorPsicologo = ({ alSeleccionar }) => {
    const [psicologos, setPsicologos] = useState([]);

    useEffect(() => {
        const cargarData = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_URL}/psicologos`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}` // ✅ Token agregado
                    }
                });
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
        <div className="selector-psicologo-wrapper">
            <label className="selector-label">Elige tu especialista</label>
            <select
                className="selector-psicologo"
                onChange={(e) => {
                    const id = parseInt(e.target.value);
                    const p = psicologos.find(ps => ps.id_usuario === id);
                    alSeleccionar(p || null);
                }}
                defaultValue=""
            >
                <option value="" disabled>— Selecciona un especialista —</option>
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
