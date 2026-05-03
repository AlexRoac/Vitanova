import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/loginform/loginform";
import Swal from 'sweetalert2';

function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate(); 
  const API_URL = process.env.REACT_APP_API_URL || "";

  useEffect(() => {
    const savedEmail = localStorage.getItem("prefillEmail");
    if (savedEmail) {
      setCorreo(savedEmail);
      localStorage.removeItem("prefillEmail");
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: correo, password }), 
      });

      const data = await res.json();

      if (!res.ok) {
        Swal.fire({
          icon: "error",
          title: "Error de acceso",
          text: data.msg || "Credenciales incorrectas, intenta de nuevo.",
          confirmButtonColor: "#3a7d8c",
          scrollbarPadding: false
        });
        return;
      }

      // Guardar sesión
      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data.user));

      // ALERTA DE ÉXITO CON ESPERA
      Swal.fire({
        icon: "success",
        title: "¡Bienvenido!",
        text: "Has iniciado sesión correctamente.",
        timer: 1500,
        showConfirmButton: false,
        scrollbarPadding: false
      }).then(() => {
        navigate("/dashboard");
      });
      
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error de red",
        text: "No se pudo conectar con el servidor. Verifica tu conexión.",
        confirmButtonColor: "#3a7d8c",
        scrollbarPadding: false
      });
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch(`${API_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await res.json();

      if (!res.ok) {
        return Swal.fire({
          icon: "error",
          title: "Error con Google",
          text: data.error || "No pudimos validar tu cuenta de Google.",
          scrollbarPadding: false
        });
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data.user));

      if (data.user.perfil_completo === false) {
        Swal.fire({
          icon: "info",
          title: `¡Hola ${data.user.nombre}!`,
          text: "Por favor completa tus datos para continuar.",
          confirmButtonText: "Ir a mi perfil",
          confirmButtonColor: "#3a7d8c",
          scrollbarPadding: false
        }).then(() => {
          navigate("/completar-perfil");
        });
      } else {
        Swal.fire({
          icon: "success",
          title: "Acceso correcto",
          timer: 1000,
          showConfirmButton: false,
          scrollbarPadding: false
        }).then(() => {
          navigate("/dashboard");
        });
      }

    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Ocurrió un fallo en la conexión.", "error");
    }
  };

  return (
    <LoginForm
      correo={correo}
      password={password}
      showPassword={showPassword}
      setShowPassword={setShowPassword}
      onCorreoChange={(e) => setCorreo(e.target.value)}
      onPasswordChange={(e) => setPassword(e.target.value)}
      onSubmit={handleLogin}
      onGoogleSuccess={handleGoogleSuccess}
      onGoogleError={() => Swal.fire("Error", "Falló la conexión con Google", "error")}
    />
  );
}

export default Login;