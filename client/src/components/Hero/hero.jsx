import "./hero.css";
import {default as psicologia} from "../../assets/psicologia.png";
function Hero() {
    return (
    <>
    <section className="hero">
        <div className="hero-container">
        <div className="hero-text">
            <span className="hero-tag">Atención psicológica profesional</span>
            <h1>
            Cuida tu salud mental <br/>
            con el mismo compromiso que tu salud física
            </h1>
            <p>
            Ignorar el problema no lo hace desaparecer. 
            Da el primer paso hacia tu bienestar emocional.
            </p>
            <div className="hero-buttons">
            <a href="#" className="btn-primary">Agendar cita</a>
            <a href="#" className="btn-secondary">Ver servicios</a>
            </div>
        </div>
        <div className="hero-image">
            <img src={psicologia} alt="Psicología"/>
        </div>
        </div>
    </section>
    </>
    )
}
export default Hero;