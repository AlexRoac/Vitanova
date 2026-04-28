import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar/navbar';
import Footer from '../components/Footer/Footer';
import CitaCard from '../components/Citas/CitaCard';
import Swal from 'sweetalert2';

const Historial = () => {
    const [citas, setCitas] = useState([]);
    const [loading, setLoading] = useState(true);
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    useEffect(() => {
        if (!usuario?.id) return;

        const cargarCitas = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_URL}/citas/psicologo/${usuario.id}`);
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

    const cancelarCita = async (idCita) => {
        const confirmacion = await Swal.fire({
            title: '¿Cancelar esta cita?',
            html: `
                <p style="color:#4a6070; margin:0; font-size:0.92rem; line-height:1.7">
                    Esta acción <strong style="color:#c0392b">no se puede deshacer</strong>.<br/>
                    El horario será liberado para otros pacientes.
                </p>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#c0392b',
            cancelButtonColor: '#aab8c2',
            confirmButtonText: 'Sí, cancelar cita',
            cancelButtonText: 'No, mantener'
        });

        if (!confirmacion.isConfirmed) return;

        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/citas/cancelar/${idCita}`, {
                method: 'PUT'
            });

            if (res.ok) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Cita cancelada',
                    text: 'La cita ha sido cancelada y el horario fue liberado.',
                    confirmButtonColor: '#60A6BF',
                    confirmButtonText: 'Entendido',
                    timer: 4000,
                    timerProgressBar: true
                });
                setCitas(prev => prev.filter(c => c.id !== idCita));
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al cancelar',
                    text: 'No se pudo cancelar la cita. Intenta de nuevo.',
                    confirmButtonColor: '#60A6BF',
                    confirmButtonText: 'Cerrar'
                });
            }
        } catch (error) {
            console.error("Error en la solicitud de cancelación:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error de conexión',
                text: 'No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.',
                confirmButtonColor: '#60A6BF',
                confirmButtonText: 'Cerrar'
            });
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

export default Historial;