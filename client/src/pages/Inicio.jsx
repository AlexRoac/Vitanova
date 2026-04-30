import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar/navbar";
import Hero from "../components/Hero/hero";
import Footer from "../components/Footer/Footer";
import Nav from "../components/nav/nav";
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