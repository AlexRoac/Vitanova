import "./Experiencia.css"
import fotoperf from "../../assets/fotoperf.jpeg"
function Experiencia() {
  return (
    <>
        <div className="experiencia-container">
        <h1>Nuestra Experiencia</h1>
        
            <div className="experiencia-content">
                <div className="experiencia-imagen">
                    <img src={fotoperf} alt="Psicóloga"/>
                </div>
                
                <div className="experiencia-texto">
                    <h2>Lic. Claudia Fregoso</h2>
                    <p className="subtitulo">Licenciada en Psicologia.</p>
                    <div className="experiencia-item">
                        <p>
                            Egresada de la Licenciatura en Psicología (UNE) he dedicado mi  carrera al acompañamiento emocional, 
                            educativo y espiritual de niños, adolescentes y adultos. <br/>
                            <br/>
                            Inicie mi trayectoria profesional como Docente de Secundaria y Preparatoria, y posteriormente como 
                            Supervisora Académica. Mi formación se ha centrado en evaluación, diagnóstico e intervención psicológica 
                            en población infantojuvenil. <br/>
                            <br/>
                            Directora y Fundadora del espacio terapéutico Vital Psicología, actualmente Vitanova Psicología, 
                            donde he desarrollado programas de atención emocional y orientación terapéutica. Cuento con 
                            entrenamiento especializado en terapia con bioretroalimentación, formando parte del equipo 
                            multidisciplinario de la Clínica Moriah en el tratamiento de pacientes con incontinencia urinaria y fecal. <br/>
                            Complemente mi preparación con estudios en Terapia Breve Centrada en Soluciones , y curse la 
                            Escuela Ministerial de Redding, California, donde profundice en la sanidad emocional y espiritual
                            como parte del desarrollo integral de la identidad. Durante este periodo, tuve la oportunidad de 
                            colaborar en comunidades de América Latina, incluyendo Buenos Aires (Argentina), y distintas ciudades 
                            de México como Ciudad de México, Monterrey y Guanajuato. <br/>
                            En el ámbito organizacional, he trabajado en el área de Reclutamiento y Selección de Personal, 
                            brindando apoyo a empresas de la zona conurbada, y he contribuido como psicóloga voluntaria en la 
                            Casa Hogar Ejército de Salvación, fortaleciendo mi compromiso social. <br/>Actualmente, curso la Especialidad 
                            en Terapia Familiar Sistémica  así como un entrenamiento en sanidad interior a través del programa 
                            PSYSON, una plataforma de psicología cristiana. <br/>
                            <br/>
                            Me desempeño como Docente a nivel universitario compartiendo mi experiencia y vocación con nuevas 
                            generaciones de profesionistas.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </>
  )
}

export default Experiencia
