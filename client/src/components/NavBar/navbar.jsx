import "./navbar.css";
import { default as logoV3 } from "../../assets/Logo_Vita3.png";
import { default as logoV4 } from "../../assets/Logo_Vita4.png";
import { FaUserCircle } from "react-icons/fa";

function NavBar() {
  const handleLogin = () => {
    window.location.href = "/Login";
  };

  const handleRegister = () => {
    window.location.href = "/Register";
  };

  return (
    <div className="container-nav">
      <div className="logo-container">
        <img src={logoV3} alt="Logo V3" className="logoV3" />
        <img src={logoV4} alt="Logo V4" className="logoV4" />
      </div>

      {/* BOTONES (desktop) */}
      <div className="menubtn-container">
        <button className="menu-btn" onClick={handleLogin}>Log in</button>
        <button className="menu-btn" onClick={handleRegister}>Sign up</button>
      </div>

     <div className="user-icon" onClick={handleLogin}>
  <FaUserCircle />
</div>
    </div>
  );
}

export default NavBar;