import Experiencia from '../components/Experiencia/Experiencia';
import NavBar from '../components/NavBar/navbar';
import Footer from '../components/Footer/Footer';


function ExperienciaPage() {
  return (
    <div>
        <div className="page-container">
            <NavBar />
            <div className="page-content"> 
                <Experiencia />  
            </div>
            <Footer />
        </div> 
    </div>
  )
}

export default ExperienciaPage
