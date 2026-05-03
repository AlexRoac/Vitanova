import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import RegisterForm from "../components/registerform/registerform";
import Swal from 'sweetalert2';

function Register() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate(); 
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
  // 1. REGISTRO MANUAL
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
        Swal.fire({
          icon: "error",
          title: "Error al registrar",
          text: data.msg || "No se pudo completar el registro.",
          confirmButtonColor: "#3a7d8c",
          scrollbarPadding: false
        });
        return;
      }

      // ÉXITO: Esperamos a que el usuario vea el mensaje antes de mandarlo al login
      Swal.fire({
        icon: "success",
        title: "¡Registro exitoso!",
        text: "Ahora puedes iniciar sesión con tu cuenta.",
        confirmButtonText: "Ir al Login",
        confirmButtonColor: "#3a7d8c",
        scrollbarPadding: false
      }).then((result) => {
        // Usamos navigate en lugar de window.location para mantener la fluidez de React
        navigate("/login");
      });
      
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error de servidor",
        text: "Hubo un problema al conectar con el servidor.",
        confirmButtonColor: "#3a7d8c",
        scrollbarPadding: false
      });
    }
  };
  
  // ==========================================
  // 2. REGISTRO CON GOOGLE
  // ==========================================
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
        return Swal.fire({
          title: "Error",
          text: "Hubo un error al intentar registrarse con Google.",
          icon: "error",
          confirmButtonColor: "#3a7d8c",
          scrollbarPadding: false
        });
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data.user));

      // Si el perfil está incompleto (común en Google Login)
      if (data.user.perfil_completo === false) {
        Swal.fire({
          icon: "info",
          title: "¡Bienvenido!",
          text: "Tu cuenta se creó con Google, pero necesitamos unos datos extra.",
          confirmButtonText: "Completar Perfil",
          confirmButtonColor: "#3a7d8c",
          scrollbarPadding: false
        }).then(() => {
          navigate("/completar-perfil");
        });
      } else {
        Swal.fire({
          icon: "success",
          title: "¡Bienvenido!",
          timer: 1500,
          showConfirmButton: false,
          scrollbarPadding: false
        }).then(() => {
          navigate("/dashboard");
        });
      }

    } catch (error) {
      Swal.fire("Error", "Error conectando al servidor", "error");
    }
  };

  const handleGoogleError = () => {
    Swal.fire({
      title: "Error",
      text: "Falló la autenticación con Google. Intenta de nuevo.",
      icon: "error",
      confirmButtonColor: "#3a7d8c",
      scrollbarPadding: false
    });
  };

  return (
    <RegisterForm
      step={step}
      formData={formData}
      handleChange={handleChange}
      nextStep={nextStep}
      prevStep={prevStep}
      handleSubmit={handleRegister}
      onGoogleSuccess={handleGoogleSuccess}
      onGoogleError={handleGoogleError}
    />
  );
}

export default Register;