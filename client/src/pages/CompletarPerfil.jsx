import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
// Ajusta esta ruta dependiendo de dónde guardaste el componente:
import CompletarPerfilForm from "../components/CompletarPerfilForm/CompletarPerfilForm";
import Swal from 'sweetalert2';

function CompletarPerfil() {
  const [formData, setFormData] = useState({
    telefono: "",
    fecha_nacimiento: "",
    ocupacion: "",
    genero: "",
    estado_civil: ""
  });

  const API_URL = process.env.REACT_APP_API_URL || "";

  const navigate = useNavigate();

  // Verificamos que el usuario realmente tenga un token (haya iniciado sesión)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const usuario = JSON.parse(localStorage.getItem("usuario"));

      // Llamamos a la nueva ruta del backend 
      const res = await fetch(`${API_URL}/auth/completar-perfil/${usuario.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        return Swal.fire({
          icon: "error",
          title: "Error de acceso",
          text: data.msg || "Error al actualizar los datos",
          confirmButtonColor: "#37b0d5",
              });
      }

      // Actualizamos el usuario en el localStorage para quitar la bandera
      usuario.perfil_completo = true;
      localStorage.setItem("usuario", JSON.stringify(usuario));
      
      Swal.fire({
          icon: "error",
          title: "Error de acceso",
          text: "¡Perfil completado con éxito!",
          confirmButtonColor: "#37b0d5",
              });
      navigate("/dashboard");

    } catch (error) {
      console.error(error);
      alert("Error conectando al servidor");
    }
  };

  // Renderizamos el componente visual pasándole la info y funciones
  return (
    <CompletarPerfilForm
      formData={formData}
      onChange={handleChange}
      onSubmit={handleSubmit}
    />
  );
}

export default CompletarPerfil;