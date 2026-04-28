import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import Swal from 'sweetalert2'; // Importamos SweetAlert2

// Ajusta esta ruta dependiendo de dónde guardaste el componente:
import CompletarPerfilForm from "../components/CompletarPerfilForm/CompletarPerfilForm";

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
        // Alerta de error desde el backend
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.msg || "Error al actualizar los datos",
          confirmButtonColor: '#60A6BF'
        });
        return; // Cortamos la ejecución
      }

      // Actualizamos el usuario en el localStorage para quitar la bandera
      usuario.perfil_completo = true;
      localStorage.setItem("usuario", JSON.stringify(usuario));

      // Alerta de éxito con await para que se vea antes de navegar
      await Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: '¡Perfil completado con éxito!',
        timer: 2000,
        showConfirmButton: false
      });
      
      navigate("/dashboard");

    } catch (error) {
      console.error(error);
      // Alerta de error de conexión
      Swal.fire({
        icon: 'error',
        title: 'Error de red',
        text: 'Error conectando al servidor',
        confirmButtonColor: '#60A6BF'
      });
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