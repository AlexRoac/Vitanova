import "./Terminos.css"

function Terminos() {
  return (
    <>
    <div className="terminos-container">
    <h1>Términos y Condiciones</h1>
    
    <div className="terminos-content">
        <div className="terminos-section">
            <h2>1. Servicios Profesionales</h2>
            <p>Vitanova Psicología ofrece servicios de psicoterapia individual, de pareja y familiar. Nuestros profesionales cuentan con la formación y certificaciones necesarias para brindar estos servicios de acuerdo con los estándares éticos y profesionales de la psicología.</p>
        </div>
        
        <div className="terminos-section">
            <h2>2. Citas y Cancelaciones</h2>
            <p>Las citas deben ser programadas con anticipación a través de nuestro sistema de agenda en línea, por teléfono o correo electrónico. En caso de necesitar cancelar o reprogramar una cita, se solicita hacerlo con al menos 24 horas de anticipación. Las cancelaciones con menos de 24 horas de anticipación o las inasistencias sin previo aviso podrían generar un cargo por el valor total de la sesión.</p>
        </div>
        
        <div className ="terminos-section">
            <h2>3. Confidencialidad</h2>
            <p>Toda la información compartida durante las sesiones terapéuticas es estrictamente confidencial y está protegida por el secreto profesional. Sin embargo, existen excepciones legales a esta confidencialidad:</p>
            <ul>
                <li>Cuando existe riesgo inminente de daño para el paciente o terceros.</li>
                <li>En casos de abuso o maltrato a menores, ancianos o personas vulnerables.</li>
                <li>Cuando es requerido por una orden judicial.</li>
                <li>Cuando el paciente autoriza expresamente la divulgación de información específica.</li>
            </ul>
        </div>
        
        <div className="terminos-section">
            <h2>4. Honorarios y Pagos</h2>
            <p>Los honorarios por nuestros servicios se establecen de acuerdo con el tipo de terapia y la duración de las sesiones. El pago debe realizarse al finalizar cada sesión, a menos que se haya acordado un plan de pago diferente. Aceptamos pagos en efectivo, transferencia bancaria y tarjetas de crédito/débito.</p>
        </div>
        
        <div className="terminos-section">
            <h2>5. Duración de las Sesiones</h2>
            <p>Las sesiones terapéuticas tienen una duración estándar de 50-60 minutos, aunque pueden variar según el tipo de terapia y las necesidades específicas del paciente. Es importante respetar los horarios establecidos para garantizar la calidad del servicio para todos nuestros pacientes.</p>
        </div>
        
        <div className="terminos-section">
            <h2>6. Comunicación entre Sesiones</h2>
            <p>La comunicación entre sesiones debe limitarse a cuestiones administrativas como programación de citas. Para situaciones de emergencia, se recomienda contactar a servicios de emergencia locales o acudir a un centro de atención de crisis.</p>
        </div>
        
        <div className="terminos-section">
            <h2>7. Terminación del Tratamiento</h2>
            <p>La decisión de finalizar el tratamiento terapéutico puede ser tomada por el paciente o el terapeuta. Se recomienda discutir esta decisión durante una sesión para facilitar un cierre adecuado del proceso terapéutico.</p>
        </div>
        
        <div className="terminos-section">
            <h2>8. Uso de la Plataforma en Línea</h2>
            <p>El uso de nuestra plataforma en línea para agendar citas está sujeto a las siguientes condiciones:</p>
            <ul>
                <li>La información proporcionada debe ser veraz y actualizada.</li>
                <li>El usuario es responsable de mantener la confidencialidad de sus credenciales de acceso.</li>
                <li>El uso indebido de la plataforma puede resultar en la suspensión del acceso.</li>
            </ul>
        </div>
        
        <div className="terminos-section">
            <h2>9. Modificaciones a los Términos y Condiciones</h2>
            <p>Vitanova Psicología se reserva el derecho de modificar estos términos y condiciones en cualquier momento. Los cambios serán notificados a través de nuestra página web y/o correo electrónico.</p>
        </div>
        
        <div className="terminos-section">
            <h2>10. Aceptación de los Términos</h2>
            <p>Al utilizar nuestros servicios, ya sea presenciales o a través de nuestra plataforma en línea, el usuario acepta estos términos y condiciones en su totalidad.</p>
        </div>
    </div>
    
    <div className="terminos-footer">
        <p>Última actualización: Enero 2023</p>
        <p>Para cualquier consulta relacionada con estos términos y condiciones, por favor contacte a <a href="mailto:info@vitanovapsicologia.com">info@vitanovapsicologia.com</a></p>
    </div>
</div>
    </>
  )
}

export default Terminos
