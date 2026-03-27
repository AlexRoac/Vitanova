import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
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
      const res = await fetch(`http://localhost:5000/api/auth/completar-perfil/${usuario.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        return alert(data.msg || "Error al actualizar los datos");
      }

      // Actualizamos el usuario en el localStorage para quitar la bandera
      usuario.perfil_completo = true;
      localStorage.setItem("usuario", JSON.stringify(usuario));

      alert("¡Perfil completado con éxito!");
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