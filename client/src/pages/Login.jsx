import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/loginform/loginform";
import Swal from 'sweetalert2';
import { useAuth } from "../context/AuthContext";

function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login, loginGoogle } = useAuth();

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
      const { ok, data } = await login({ email: correo, password });
      if (!ok) {
        return Swal.fire({
          icon: "error", title: "Error de acceso",
          text: data.msg || "Credenciales incorrectas, intenta de nuevo.",
          confirmButtonColor: "#3a7d8c", scrollbarPadding: false,
        });
      }
      await Swal.fire({
        icon: "success", title: "¡Bienvenido!",
        text: "Has iniciado sesión correctamente.",
        timer: 1500, showConfirmButton: false, scrollbarPadding: false,
      });
      navigate("/dashboard");
    } catch {
      Swal.fire({
        icon: "error", title: "Error de red",
        text: "No se pudo conectar con el servidor. Verifica tu conexión.",
        confirmButtonColor: "#3a7d8c", scrollbarPadding: false,
      });
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const { ok, data } = await loginGoogle(credentialResponse);
      if (!ok) {
        return Swal.fire({
          icon: "error", title: "Error con Google",
          text: data.error || "No pudimos validar tu cuenta de Google.",
          scrollbarPadding: false,
        });
      }
      if (data.user.perfil_completo === false) {
        await Swal.fire({
          icon: "info", title: `¡Hola ${data.user.nombre}!`,
          text: "Por favor completa tus datos para continuar.",
          confirmButtonText: "Ir a mi perfil", confirmButtonColor: "#3a7d8c", scrollbarPadding: false,
        });
        navigate("/completar-perfil");
      } else {
        await Swal.fire({ icon: "success", title: "Acceso correcto", timer: 1000, showConfirmButton: false, scrollbarPadding: false });
        navigate("/dashboard");
      }
    } catch {
      Swal.fire("Error", "Ocurrió un fallo en la conexión.", "error");
    }
  };

  return (
    <LoginForm
      correo={correo} password={password}
      showPassword={showPassword} setShowPassword={setShowPassword}
      onCorreoChange={(e) => setCorreo(e.target.value)}
      onPasswordChange={(e) => setPassword(e.target.value)}
      onSubmit={handleLogin}
      onGoogleSuccess={handleGoogleSuccess}
      onGoogleError={() => Swal.fire("Error", "Falló la conexión con Google", "error")}
    />
  );
}
export default Login;