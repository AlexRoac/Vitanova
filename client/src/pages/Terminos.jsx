import Terminos from '../components/Terminos/Terminos';
import NavBar from '../components/NavBar/navbar';
import Footer from '../components/Footer/Footer';



function TerminosPage() {
  return (
    <div className="page-container">
            <NavBar />
            <div className="page-content"> 
                <Terminos />  
            </div>
            <Footer />
        </div> 
  )
}

export default TerminosPage
