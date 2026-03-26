import NavBar from "../components/NavBar/navbar";
import Dashboard from "../components/Dashboard/Dashboard";
import Footer from "../components/Footer/Footer";
function UDash() {
    return (
        <>
        <div className="page-container">
            <NavBar />
            <div className="page-content">
                <Dashboard/>
            </div>
            <Footer />
        </div>
        </>
    )
}
export default UDash;