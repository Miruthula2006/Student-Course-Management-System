import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";

const PageShell = ({ children }) => {
    return (
        <>
            <Navbar />

            <main>
                {children}
            </main>

            <Footer />
        </>
    );
};

export default PageShell;