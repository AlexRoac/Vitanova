import React from 'react';
import NavBar from '../components/NavBar/navbar';
import Footer from '../components/Footer/Footer';
import GestionarHorarios from '../components/Horarios/GestionarHorarios';

const DisponibilidadPage = () => {
    return (
        <div className="page-container">
            <NavBar />
            
            <main style={{
                    minHeight: '80vh',
                    padding: '40px 20px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-start'
                }} className="page-content">
                <div className="container">
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