import { useState } from "react";
import { useNavigate } from "react-router-dom"; // <-- IMPORTANTE: Lo agregamos para poder redireccionar
import RegisterForm from "../components/registerform/registerform";

function Register() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate(); // <-- Inicializamos navigate
  const API_URL = process.env.REACT_APP_API_URL || "";

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  // ==========================================
  // 1. REGISTRO MANUAL (El que ya tenías)
  // ==========================================
  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
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
      window.location.href = '/login';
      
    } catch (error) {
      console.error(error);
      alert("Error conectando al servidor");
    }
  };
  
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch(`${API_URL}/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await res.json();

      if (!res.ok) {
        return alert(data.msg || "Error al registrarse con Google");
      }

      // Guardamos la sesión en el navegador
      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data.user));

      // Magia: Como el usuario se registró con Google, no tiene teléfono ni ocupación.
      // Así que lo mandamos a la pantalla de completar perfil.
      if (data.user.perfil_completo === false) {
        navigate("/completar-perfil");
      } else {
        navigate("/dashboard");
      }

    } catch (error) {
      console.error("Error conectando al servidor:", error);
      alert("Error al conectar con el servidor de Google");
    }
  };

  const handleGoogleError = () => {
    alert("Hubo un error al intentar registrarse con Google.");
  };

  return (
    <RegisterForm
      step={step}
      formData={formData}
      handleChange={handleChange}
      nextStep={nextStep}
      prevStep={prevStep}
      handleSubmit={handleRegister}
      // Le pasamos las nuevas funciones al componente visual
      onGoogleSuccess={handleGoogleSuccess}
      onGoogleError={handleGoogleError}
    />
  );
}

export default Register;