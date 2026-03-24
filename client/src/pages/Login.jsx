import { useState } from "react";
import { useNavigate } from "react-router-dom"; // <-- Importamos useNavigate para cambiar de página
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
        // Mapeamos 'correo' a 'email' para que el backend lo entienda
        body: JSON.stringify({ email: correo, password }), 
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.msg);
        return;
      }

      // --- AQUÍ SUCEDE LA MAGIA DEL TOKEN Y LA REDIRECCIÓN ---
      
      // 1. Guardamos el token en el almacenamiento local del navegador
      localStorage.setItem("token", data.token);

      // 2. Opcional pero recomendado: Guardamos los datos básicos del usuario
      // por si quieres mostrar su nombre en la barra de navegación del inicio
      localStorage.setItem("usuario", JSON.stringify(data.user));

      // 3. Mostramos la alerta de bienvenida
      alert("Bienvenido " + data.user.nombre);

      // 4. Redirigimos a la ruta "/inicio" (sin el .jsx)
      navigate("/inicio");
      
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
    />
  );
}

export default Login;