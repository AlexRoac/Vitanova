import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CompletarPerfilForm from "../components/CompletarPerfilForm/CompletarPerfilForm";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext";

function CompletarPerfil() {
  const navigate = useNavigate();
  const { token, actualizarUsuario, logout } = useAuth();
  const API_URL = process.env.REACT_APP_API_URL;

  const [formData, setFormData] = useState({
    telefono: "", fecha_nacimiento: "", ocupacion: "", genero: "", estado_civil: "",
  });

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/auth/completar-perfil`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        return Swal.fire({
          icon: "error", title: "Error",
          text: data.msg || "No se pudo actualizar el perfil.",
          confirmButtonColor: "#3a7d8c", scrollbarPadding: false,
        });
      }

      // Actualizar usuario en el contexto (no localStorage directo)
      actualizarUsuario({ perfil_completo: true });

      await Swal.fire({
        icon: "success", title: "¡Perfil completado!",
        text: "Ya puedes usar todas las funciones de la plataforma.",
        confirmButtonColor: "#3a7d8c", timer: 2000,
        showConfirmButton: false, scrollbarPadding: false,
      });
      navigate("/dashboard");
    } catch {
      Swal.fire({
        icon: "error", title: "Error de conexión",
        text: "No se pudo conectar con el servidor.",
        confirmButtonColor: "#3a7d8c", scrollbarPadding: false,
      });
    }
  };

  return <CompletarPerfilForm formData={formData} onChange={handleChange} onSubmit={handleSubmit} />;
}
export default CompletarPerfil;