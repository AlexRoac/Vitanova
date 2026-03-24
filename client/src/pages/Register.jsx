import { useState } from "react";
import RegisterForm from "../components/registerform/registerform";

function Register() {
  // Estado para controlar en qué paso del formulario estamos (1 o 2)
  const [step, setStep] = useState(1);

  // Estado unificado para todos los datos del formulario
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    nombre: "",
    apellido: "",
    telefono: "",
    fecha_nacimiento: "",
    ocupacion: "",
    genero: "",
    estado_civil: ""
  });

  // Función para manejar los cambios en CUALQUIER input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Funciones para avanzar y retroceder de paso
  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  // Petición al backend al finalizar el paso 2
  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.msg || "Error al registrar usuario");
        return;
      }

      alert("Registro exitoso. ¡Bienvenido, " + data.user.nombre + "!");
      // window.location.href = '/login'; // Descomenta esto para redirigir al login
      
    } catch (error) {
      console.error(error);
      alert("Error conectando al servidor");
    }
  };

  return (
    <RegisterForm
      step={step}
      formData={formData}
      handleChange={handleChange}
      nextStep={nextStep}
      prevStep={prevStep}
      handleSubmit={handleRegister}
    />
  );
}

export default Register;