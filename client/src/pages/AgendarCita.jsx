import React, { useState } from 'react';
import NavBar from '../components/NavBar/navbar';
import Footer from '../components/Footer/Footer';
import SeleccionarCita from '../components/Citas/SeleccionarCita';
import SelectorPsicologo from '../components/Citas/SelectorPsicologo';

const AgendarCita = () => {
    const [psicologo, setPsicologo] = useState(null);

    return (
        <div>
            <NavBar />
            <main style={{ minHeight: '80vh', padding: '50px', textAlign: 'center' }}>
                <h1>Reserva tu Cita</h1>
                
                {/* El dropdown ahora es una sola línea */}
                <SelectorPsicologo alSeleccionar={setPsicologo} />

                {psicologo ? (
                    <SeleccionarCita 
                        psicologoId={psicologo.id_usuario} 
                        nombrePsicologo={`${psicologo.nombre} ${psicologo.apellido}`} 
                    />
                ) : (
                    <p>Selecciona un psicólogo para ver su agenda.</p>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default AgendarCita;