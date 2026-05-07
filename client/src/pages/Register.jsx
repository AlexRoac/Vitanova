import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RegisterForm from "../components/registerform/registerform";
import Swal from 'sweetalert2';
import { useAuth } from "../context/AuthContext";

function Register() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { loginGoogle } = useAuth();
  const API_URL = process.env.REACT_APP_API_URL || "";

  const [formData, setFormData] = useState({
    email: "", password: "", nombre: "", apellido: "",
    telefono: "", fecha_nacimiento: "", ocupacion: "", genero: "", estado_civil: ""
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        return Swal.fire({
          icon: "error", title: "Error al registrar",
          text: data.msg || "No se pudo completar el registro.",
          confirmButtonColor: "#3a7d8c", scrollbarPadding: false,
        });
      }
      await Swal.fire({
        icon: "success", title: "¡Registro exitoso!",
        text: "Ahora puedes iniciar sesión con tu cuenta.",
        confirmButtonText: "Ir al Login", confirmButtonColor: "#3a7d8c", scrollbarPadding: false,
      });
      navigate("/login");
    } catch {
      Swal.fire({
        icon: "error", title: "Error de servidor",
        text: "Hubo un problema al conectar con el servidor.",
        confirmButtonColor: "#3a7d8c", scrollbarPadding: false,
      });
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const { ok, data } = await loginGoogle(credentialResponse);
      if (!ok) {
        return Swal.fire({
          title: "Error", text: "Hubo un error al intentar registrarse con Google.",
          icon: "error", confirmButtonColor: "#3a7d8c", scrollbarPadding: false,
        });
      }
      if (data.user.perfil_completo === false) {
        await Swal.fire({
          icon: "info", title: "¡Bienvenido!",
          text: "Tu cuenta se creó con Google, pero necesitamos unos datos extra.",
          confirmButtonText: "Completar Perfil", confirmButtonColor: "#3a7d8c", scrollbarPadding: false,
        });
        navigate("/completar-perfil");
      } else {
        await Swal.fire({ icon: "success", title: "¡Bienvenido!", timer: 1500, showConfirmButton: false, scrollbarPadding: false });
        navigate("/dashboard");
      }
    } catch {
      Swal.fire("Error", "Error conectando al servidor", "error");
    }
  };

  return (
    <RegisterForm
      step={step} formData={formData}
      handleChange={handleChange} nextStep={nextStep} prevStep={prevStep}
      handleSubmit={handleRegister}
      onGoogleSuccess={handleGoogleSuccess}
      onGoogleError={() => Swal.fire({ title: "Error", text: "Falló la autenticación con Google.", icon: "error", confirmButtonColor: "#3a7d8c", scrollbarPadding: false })}
    />
  );
}
export default Register;