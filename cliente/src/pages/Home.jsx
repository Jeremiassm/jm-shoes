import Navbar from "../components/layout/Navbar";
import Hero from "../components/home/Hero";
import FeaturedSneakers from "../components/home/FeaturedSneaker";
import TrustStrip from "../components/home/TrustStrip";
import Brands from "../components/home/Brands";
import HowItWorksPreview from "../components/home/HowItWorksPreview";
import Footer from "../components/layout/Footer";
import SEO from "../components/SEO";

export default function Home() {
  return (
    <div className="bg-black min-h-screen text-white">
      <SEO
        title="JM Shoes - Zapatillas Exclusivas para Basketball"
        description="Descubrí las zapatillas más exclusivas para jugadores de basketball. Nike GT Cut, Kobe Protro, JA Morant y más. Rendimiento y estilo en cada paso."
        keywords="zapatillas basketball, nike gt cut, kobe protro, ja morant, jm shoes"
      />
      <Navbar />
      <Hero />
      <FeaturedSneakers />
      <TrustStrip />
      <Brands />
      <HowItWorksPreview />
      <Footer />
    </div>
  );
}
