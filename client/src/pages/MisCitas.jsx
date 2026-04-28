import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar/navbar';
import Footer from '../components/Footer/Footer';
import CitaCard from '../components/Citas/CitaCard';

const MisCitas = () => {
    const [citas, setCitas] = useState([]);
    const [loading, setLoading] = useState(true);
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    useEffect(() => {
        if (!usuario?.id) return;

        const cargarCitas = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_URL}/citas/paciente/${usuario.id}`);
                const data = await res.json();
                if (res.ok) {
                    setCitas(data);
                }
            } catch (error) {
                console.error("Error al buscar citas:", error);
            } finally {
                setLoading(false);
            }
        };
        cargarCitas();
    }, [usuario?.id]);

    // Función para manejar la cancelación de la cita
    const cancelarCita = async (idCita) => {
        if (!window.confirm("¿Estás seguro de que deseas cancelar esta cita? El horario será liberado.")) return;

        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/citas/cancelar/${idCita}`, {
                method: 'PUT'
            });

            if (res.ok) {
                alert("Cita cancelada con éxito");
                // Recarga la página para actualizar la lista de citas
                window.location.reload(); 
            } else {
                alert("Error al cancelar la cita");
            }
        } catch (error) {
            console.error("Error en la solicitud de cancelación:", error);
        }
    };

    return (
        <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh' }} className="page-container">
            <NavBar />
            <main style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }} className="page-content">
                <h1 style={{ color: '#2c3e50', marginBottom: '30px' }}>Mis Citas</h1>

                {loading ? (
                    <p>Cargando tus citas...</p>
                ) : citas.length > 0 ? (
                    // Aquí le pasamos la función onCancelar al componente CitaCard
                    citas.map(cita => (
                        <CitaCard 
                            key={cita.id} 
                            cita={cita} 
                            onCancelar={cancelarCita} 
                        />
                    ))
                ) : (
                    <div style={{ textAlign: 'center', padding: '50px', background: '#fff', borderRadius: '15px' }}>
                        <p style={{ color: '#7f8c8d' }}>No tienes citas programadas actualmente.</p>
                        <a href="/agendar" style={{ color: '#3498db', fontWeight: 'bold', textDecoration: 'none' }}>
                            Agendar mi primera cita
                        </a>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default MisCitas;