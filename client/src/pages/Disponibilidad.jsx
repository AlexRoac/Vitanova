import React from 'react';
import NavBar from '../components/NavBar/navbar';
import Footer from '../components/Footer/Footer';
import GestionarHorarios from '../components/Horarios/GestionarHorarios';

const DisponibilidadPage = () => {
    return (
        <div className="page-container">
            <NavBar />
            
            <main style={{ minHeight: '80vh', padding: '40px 20px' }}>
                <div className="container">
                    <h1 style={{ textAlign: 'center', color: '#2c3e50' }}>Panel del Psicólogo</h1>
                    <hr />
                    {/* Aquí insertamos el componente de lógica que creamos */}
                    <GestionarHorarios />
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default DisponibilidadPage;