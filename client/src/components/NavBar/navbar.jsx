import "./navbar.css";
import {default as logoV3} from "../../assets/Logo_Vita3.png";
import {default as logoV4} from "../../assets/Logo_Vita4.png";

function NavBar() {
    return (
        <>
        <div className="container-nav">
            <div className="logo-container">
                <img src={logoV3} alt="Logo V3" className="logoV3" />
                <img src={logoV4} alt="Logo V4" className="logoV4" />
            </div>
            <div className="menubtn-container">
                <button className="menu-btn">Log in</button>
                <button className="menu-btn">Sign up</button>
            </div>
        </div>
        </>
    )
}
export default NavBar;