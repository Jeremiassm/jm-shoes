import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import SEO from "../components/SEO";

export default function NotFound() {
  return (
    <div className="bg-black min-h-screen text-white flex flex-col">
      <SEO
        title="404 - Página no encontrada | JM Shoes"
        description="La página que buscás no existe."
      />
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-6 pt-32 pb-20">
        <div className="text-center max-w-xl">
          <p className="font-display text-9xl font-bold text-red-600 tracking-tight">404</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight mt-4">
            Página no encontrada
          </h1>
          <p className="text-zinc-400 mt-4">
            La página que buscás no existe o fue movida. Volvé al inicio o explorá nuestro catálogo.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mt-8">
            <Link
              to="/"
              className="bg-red-600 hover:bg-red-700 transition px-8 py-4 rounded-full font-semibold uppercase tracking-widest text-sm"
            >
              Ir al inicio
            </Link>
            <Link
              to="/zapatillas"
              className="border border-white/20 hover:border-white/60 hover:bg-white/5 transition px-8 py-4 rounded-full font-semibold uppercase tracking-widest text-sm"
            >
              Ver zapatillas
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
