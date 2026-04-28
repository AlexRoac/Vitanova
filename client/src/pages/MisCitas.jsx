import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar/navbar';
import Footer from '../components/Footer/Footer';
import CitaCard from '../components/Citas/CitaCard';
import Swal from 'sweetalert2';

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

    const cancelarCita = async (idCita) => {
        // Confirmación con SweetAlert2
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
                // Alerta de éxito — actualiza la lista sin recargar la página
                await Swal.fire({
                    icon: 'success',
                    title: 'Cita cancelada',
                    text: 'Tu cita ha sido cancelada y el horario fue liberado.',
                    confirmButtonColor: '#60A6BF',
                    confirmButtonText: 'Entendido',
                    timer: 4000,
                    timerProgressBar: true
                });
                // Quita la cita del estado en lugar de recargar la página
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
        <div style={{ backgroundColor: '#f4f7fa', minHeight: '100vh' }} className="page-container">
            <NavBar />
            <main style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }} className="page-content">
                <h1 style={{ color: '#202343', marginBottom: '30px' }}>Mis Citas</h1>

                {loading ? (
                    <p style={{ color: '#7a8fa6' }}>Cargando tus citas...</p>
                ) : citas.length > 0 ? (
                    citas.map(cita => (
                        <CitaCard
                            key={cita.id}
                            cita={cita}
                            onCancelar={cancelarCita}
                        />
                    ))
                ) : (
                    <div style={{ textAlign: 'center', padding: '50px', background: '#fff', borderRadius: '16px', border: '1.5px dashed #d0dfe8' }}>
                        <p style={{ color: '#9ab0c0', marginBottom: '16px' }}>No tienes citas programadas actualmente.</p>
                        <a href="/agendar" style={{ color: '#60A6BF', fontWeight: '700', textDecoration: 'none' }}>
                            Agendar mi primera cita →
                        </a>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default MisCitas;