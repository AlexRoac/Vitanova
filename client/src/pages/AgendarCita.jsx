import React, { useState } from 'react';
import NavBar from '../components/NavBar/navbar';
import Footer from '../components/Footer/Footer';
import SeleccionarCita from '../components/Citas/SeleccionarCita';
import SelectorPsicologo from '../components/Citas/SelectorPsicologo';

const AgendarCita = () => {
    const [psicologo, setPsicologo] = useState(null);

    return (
        <div className="page-container">
            <NavBar />
            <main className="disponibilidad-page page-content">
                <div style={{ width: '100%', maxWidth: '780px' }}>

                    <div className="agendar-page-header">
                        <h1>Reserva tu Cita</h1>
                        <p>Selecciona un especialista y elige el horario que mejor se adapte a ti.</p>
                    </div>

                    <SelectorPsicologo alSeleccionar={setPsicologo} />

                    {psicologo ? (
                        <div style={{
                            background: '#ffffff',
                            borderRadius: '20px',
                            boxShadow: '0 4px 32px rgba(32, 35, 67, 0.08)',
                            padding: '48px 48px 40px'
                        }}>
                            <SeleccionarCita
                                psicologoId={psicologo.id_usuario}
                                nombrePsicologo={`${psicologo.nombre} ${psicologo.apellido}`}
                            />
                        </div>
                    ) : (
                        <div style={{
                            textAlign: 'center',
                            padding: '48px 24px',
                            background: '#f9fbfd',
                            borderRadius: '16px',
                            border: '1.5px dashed #d0dfe8',
                            color: '#9ab0c0',
                            fontSize: '0.92rem'
                        }}>
                            Selecciona un especialista para ver su agenda disponible.
                        </div>
                    )}

                </div>
            </main>
            <Footer />
        </div>
    );
};

export default AgendarCita;
