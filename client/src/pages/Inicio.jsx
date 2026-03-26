import { useState } from "react";
import { useNavigate } from "react-router-dom"; // <-- Importamos useNavigate para cambiar de página
import NavBar from "../components/NavBar/navbar";
import Hero from "../components/Hero/hero";
import Footer from "../components/Footer/Footer";
function Inicio() {
    return (
        <>
        <div className="page-container">
            <NavBar />
            <div className="page-content">
                <Hero />
            </div>
            <Footer />
        </div>
        </>
    )
}
export default Inicio;