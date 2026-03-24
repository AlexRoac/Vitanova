import { useState } from "react";
import { useNavigate } from "react-router-dom"; // <-- Importamos useNavigate para cambiar de página
//import inicio from "../components/inicio/inicio";

function Inicio() {
    return (
        <div>
            <h1>Bienvenido a la página principal</h1>
            <p>Esta es la página de índice.</p>
        </div>
    );

}

export default Inicio;