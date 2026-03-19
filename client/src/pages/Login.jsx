import { useState } from "react";
import LoginForm from "../components/loginform/loginform";

function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ correo, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.msg);
        return;
      }

      alert("Bienvenido " + data.user.nombre);
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
