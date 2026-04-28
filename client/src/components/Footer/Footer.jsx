import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Footer.css";
import FooterUser from "./FooterUser";
import FooterGuest from "./FooterGuest";

function Footer() {
  const [usuario, setUsuario] = useState(null);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("usuario");
    if (user) setUsuario(JSON.parse(user));
  }, []);

  const handleGuestClick = () => {
    localStorage.setItem("prefillEmail", email);
    navigate("/login");
  };

  const handleUserClick = () => {
    navigate("/dashboard");
  };

  // 🔥 Aquí decides cuál renderizar
  return usuario ? (
    <FooterUser handleClick={handleUserClick} />
  ) : (
    <FooterGuest 
      email={email}
      setEmail={setEmail}
      handleClick={handleGuestClick}
    />
  );
}

export default Footer;