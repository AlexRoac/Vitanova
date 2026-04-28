import React from 'react';
import NavBar from '../components/NavBar/navbar';
import Footer from '../components/Footer/Footer';
import GestionarHorarios from '../components/Horarios/GestionarHorarios';

const DisponibilidadPage = () => {
    return (
        <div className="page-container">
            <NavBar />
            <main className="disponibilidad-page page-content">
                <GestionarHorarios />
            </main>
            <Footer />
        </div>
    );
};

export default DisponibilidadPage;
