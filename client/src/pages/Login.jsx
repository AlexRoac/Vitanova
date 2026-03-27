import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import LoginForm from "../components/loginform/loginform";

function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Inicializamos el hook de navegación
  const navigate = useNavigate(); 

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: correo, password }), 
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.msg);
        return;
      }

      //TOKEN Y REDIRECCIÓN 
      // Guardamos el token en el almacenamiento local del navegador
      localStorage.setItem("token", data.token);
      // Guardamos los datos básicos del usuario
      localStorage.setItem("usuario", JSON.stringify(data.user));

      alert("Bienvenido " + data.user.nombre);
      navigate("/dashboard");
      
    } catch (error) {
      console.error(error);
      alert("Error conectando al servidor");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await res.json();
      if (!res.ok) return alert(data.error || "Error al iniciar sesión con Google");

      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data.user));

      // ==================================================
      // NUEVA LÓGICA: ¿Perfil completo o incompleto?
      // ==================================================
      if (data.user.perfil_completo === false) {
        alert(`¡Hola ${data.user.nombre}! Por favor completa tus datos para continuar.`);
        navigate("/completar-perfil");
      } else {
        alert("Bienvenido " + data.user.nombre);
        navigate("/dashboard");
      }

    } catch (error) {
      console.error(error);
      alert("Error conectando al servidor");
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
      onGoogleError={() => alert("Falló la conexión con Google")}
    />
  );
}

export default Login;