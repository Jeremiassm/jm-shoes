import { useParams, Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { ChevronRight, MessageCircle, Home } from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import SEO from "../components/SEO";
import { useCatalog } from "../hooks/useCatalog";
import ReviewChart from "../components/sneakers/ReviewChart";
import ProsCons from "../components/sneakers/ProsCons";
import { getWhatsAppLink, formatPrice } from "../config/contact";

export default function SneakerDetail() {
  const { id } = useParams();
  const { sneakers, loading } = useCatalog();

  const sneaker = useMemo(
    () => sneakers.find((item) => item.id === Number(id)),
    [sneakers, id]
  );

  const images = sneaker?.images ?? [];
  const [selectedImage, setSelectedImage] = useState(null);

  const currentImage = selectedImage ?? images[0] ?? "";

  if (loading && !sneaker) {
    return (
      <div className="bg-black min-h-screen text-white flex items-center justify-center">
        <p className="text-zinc-400">Cargando producto...</p>
      </div>
    );
  }

  if (!sneaker) {
    return (
      <div className="bg-black min-h-screen text-white">
        <Navbar />
        <div className="pt-32 px-6 max-w-3xl mx-auto text-center">
          <h1 className="font-display text-5xl font-bold uppercase tracking-tight">
            Producto no encontrado
          </h1>
          <p className="text-zinc-400 mt-4">
            El producto que buscás no existe o fue eliminado del catálogo.
          </p>
          <Link
            to="/zapatillas"
            className="inline-block mt-8 bg-red-600 hover:bg-red-700 transition px-8 py-3 rounded-full font-semibold uppercase tracking-widest text-sm"
          >
            Ver catálogo
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const whatsappMessage = `Hola! Me interesa la ${sneaker.name} (${sneaker.brand}) que vi en JM Shoes. Precio: ${formatPrice(sneaker.price)}. ¿Está disponible?`;
  const whatsappLink = getWhatsAppLink(whatsappMessage);

  return (
    <div className="bg-black min-h-screen text-white">
      <SEO
        title={`${sneaker.name} - ${sneaker.brand} | JM Shoes`}
        description={sneaker.description || `${sneaker.name} de ${sneaker.brand} - $${sneaker.price}. Zapatillas de basketball exclusivas en JM Shoes.`}
        keywords={`${sneaker.name}, ${sneaker.brand}, zapatillas basketball, comprar ${sneaker.brand}`}
        image={sneaker.images?.[0]}
      />
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-28">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-zinc-400 mb-8">
          <Link to="/" className="hover:text-red-500 transition flex items-center gap-1">
            <Home size={14} /> Inicio
          </Link>
          <ChevronRight size={14} />
          <Link to="/zapatillas" className="hover:text-red-500 transition">
            Zapatillas
          </Link>
          <ChevronRight size={14} />
          <span className="text-white">{sneaker.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-16 grid md:grid-cols-2 gap-14">
        <div>
          <div className="grid grid-cols-[80px_1fr] gap-4">
            <div className="flex flex-col gap-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(image)}
                  aria-label={`Imagen ${index + 1} de ${sneaker.name}`}
                  className={`w-20 h-20 overflow-hidden rounded-xl border-2 bg-zinc-900 transition ${
                    currentImage === image
                      ? "border-red-500"
                      : "border-transparent hover:border-white/30"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${sneaker.name} ${index + 1}`}
                    loading="lazy"
                    className="w-full h-full object-contain p-1"
                  />
                </button>
              ))}
            </div>

            <div className="bg-zinc-900 rounded-3xl overflow-hidden">
              <img
                src={currentImage}
                alt={sneaker.name}
                className="w-full h-full object-contain"
                style={{ minHeight: "400px" }}
              />
            </div>
          </div>

          <div className="mt-8">
            <ProsCons pros={sneaker.pros} cons={sneaker.cons} />
          </div>

          {sneaker.video && (
            <div className="mt-8">
              <video src={sneaker.video} controls className="w-full rounded-2xl" />
            </div>
          )}
        </div>

        <div>
          <p className="text-red-500 uppercase tracking-widest text-sm font-semibold">
            {sneaker.brand}
          </p>

          <h1 className="font-display text-5xl md:text-6xl font-bold mt-2 uppercase tracking-tight leading-[0.95]">
            {sneaker.name}
          </h1>

          <p className="font-display text-4xl font-bold mt-6">
            {formatPrice(sneaker.price)}
          </p>

          <p className="text-zinc-300 mt-6 leading-relaxed">
            {sneaker.description}
          </p>

          {sneaker.sizes && sneaker.sizes.length > 0 && (
            <div className="mt-10">
              <h3 className="font-display text-xl font-bold mb-4 uppercase tracking-tight">
                Talles disponibles
              </h3>
              <div className="flex flex-wrap gap-3">
                {sneaker.sizes.map((size) => (
                  <span
                    key={size}
                    className="border border-zinc-700 px-5 py-3 rounded-xl text-sm font-medium"
                  >
                    {size} US
                  </span>
                ))}
              </div>
            </div>
          )}

          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 w-full bg-green-500 hover:bg-green-600 transition px-8 py-4 rounded-2xl text-lg font-bold flex items-center justify-center gap-3 uppercase tracking-wider"
          >
            <MessageCircle size={22} />
            Pedir por WhatsApp
          </a>

          <p className="text-xs text-zinc-500 mt-3 text-center">
            Te respondemos a la brevedad con disponibilidad y medios de pago.
          </p>

          {sneaker.review && (
            <div className="mt-12">
              <ReviewChart review={sneaker.review} />
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
