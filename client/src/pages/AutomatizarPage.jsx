import React from 'react';
import NavBar from '../components/NavBar/navbar';
import Footer from '../components/Footer/Footer';
import AutomatizarHorarios from '../components/Horarios/AutomatizarHorarios';

const AutomatizarPage = () => {
    return (
        <div className="page-container">
            <NavBar />
            <main className="disponibilidad-page page-content">
                <AutomatizarHorarios />
            </main>
            <Footer />
        </div>
    );
};

export default AutomatizarPage;
