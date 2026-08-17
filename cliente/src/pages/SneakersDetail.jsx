import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  MessageCircle,
  Package,
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import SEO from "../components/SEO";
import ProsCons from "../components/sneakers/ProsCons";
import ReviewChart from "../components/sneakers/ReviewChart";
import SneakerCard from "../components/sneakers/SneakerCard";
import SneakerDetailSkeleton from "../components/sneakers/SneakerDetailSkeleton";
import { useToast } from "../hooks/useToast";
import { api } from "../lib/api";
import { getSizeList, isInStock } from "../lib/sneakers";
import { formatPrice, getWhatsAppLink } from "../config/contact";

export default function SneakerDetail() {
  const { id } = useParams();
  const { showToast } = useToast();

  const [sneaker, setSneaker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [related, setRelated] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setSneaker(null);
    setRelated([]);
    setCurrentImageIndex(0);

    api
      .getSneaker(id)
      .then((data) => {
        if (cancelled) return;
        setSneaker(data);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err?.response?.status === 404) {
          setNotFound(true);
        } else {
          console.error("Error al cargar producto:", err);
          showToast("No se pudo cargar el producto.", "error");
          setNotFound(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, showToast]);

  useEffect(() => {
    if (!sneaker?.brand) return undefined;
    let cancelled = false;
    api
      .getSneakers({ brand: sneaker.brand, limit: 4 })
      .then((data) => {
        if (cancelled) return;
        const items = Array.isArray(data) ? data : data.items || [];
        setRelated(
          items.filter((s) => s.id !== sneaker.id).slice(0, 4)
        );
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Error al cargar productos relacionados:", err);
      });
    return () => {
      cancelled = true;
    };
  }, [sneaker]);

  const images = useMemo(() => sneaker?.images ?? [], [sneaker]);
  const currentImage = images[currentImageIndex] ?? images[0] ?? "";

  const goPrev = useCallback(() => {
    if (images.length === 0) return;
    setCurrentImageIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  const goNext = useCallback(() => {
    if (images.length === 0) return;
    setCurrentImageIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  const handleGalleryKey = useCallback(
    (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    },
    [goPrev, goNext]
  );

  if (loading) {
    return <SneakerDetailSkeleton />;
  }

  if (notFound || !sneaker) {
    return (
      <div className="bg-black min-h-screen text-white">
        <Navbar />
        <div className="pt-32 px-6 max-w-3xl mx-auto text-center pb-20">
          <div className="w-20 h-20 mx-auto rounded-full bg-zinc-900 flex items-center justify-center mb-6">
            <Package className="text-red-500" size={36} aria-hidden="true" />
          </div>
          <h1 className="font-display text-5xl font-bold uppercase tracking-tight">
            Producto no encontrado
          </h1>
          <p className="text-zinc-400 mt-4">
            El producto que buscás no existe o fue eliminado del catálogo.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mt-8">
            <Link
              to="/zapatillas"
              className="bg-red-600 hover:bg-red-700 transition px-8 py-3 rounded-full font-semibold uppercase tracking-widest text-sm"
            >
              Ver catálogo
            </Link>
            <Link
              to="/"
              className="border border-white/20 hover:border-white/60 hover:bg-white/5 transition px-8 py-3 rounded-full font-semibold uppercase tracking-widest text-sm"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const sizes = getSizeList(sneaker);
  const hasSizes = sizes.length > 0;
  const sizesWithStock =
    Array.isArray(sneaker.sizes) &&
    sneaker.sizes.length > 0 &&
    typeof sneaker.sizes[0] === "object";
  const outOfStock = !isInStock(sneaker);
  const whatsappMessage = `Hola! Me interesa la ${sneaker.name} (${sneaker.brand}) que vi en JM Shoes. Precio: ${formatPrice(sneaker.price)}. ¿Está disponible?`;
  const whatsappLink = getWhatsAppLink(whatsappMessage);

  return (
    <div className="bg-black min-h-screen text-white">
      <SEO
        title={`${sneaker.name} - ${sneaker.brand} | JM Shoes`}
        description={
          sneaker.description ||
          `${sneaker.name} de ${sneaker.brand} - $${sneaker.price}. Zapatillas de basketball exclusivas en JM Shoes.`
        }
        keywords={`${sneaker.name}, ${sneaker.brand}, zapatillas basketball, comprar ${sneaker.brand}`}
        image={sneaker.images?.[0]}
        url={window.location.href}
      />
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-28">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-sm text-zinc-400 mb-8"
        >
          <Link
            to="/"
            className="hover:text-red-500 transition flex items-center gap-1"
          >
            <Home size={14} aria-hidden="true" /> Inicio
          </Link>
          <ChevronRight size={14} aria-hidden="true" />
          <Link to="/zapatillas" className="hover:text-red-500 transition">
            Zapatillas
          </Link>
          <ChevronRight size={14} aria-hidden="true" />
          <span aria-current="page" className="text-white">
            {sneaker.name}
          </span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-16 grid md:grid-cols-2 gap-14">
        <div
          className="grid grid-cols-[80px_1fr] gap-4 min-h-0"
          role="region"
          aria-label={`Galeria de imagenes de ${sneaker.name}`}
        >
          <div
            className="flex flex-col gap-2 overflow-y-auto pr-1 min-h-0"
            style={{ scrollbarWidth: "thin", scrollbarColor: "#52525b transparent" }}
          >
            {images.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setCurrentImageIndex(index)}
                aria-label={`Ver imagen ${index + 1} de ${images.length}`}
                aria-current={currentImageIndex === index ? "true" : undefined}
                className={`w-20 h-20 flex-shrink-0 overflow-hidden rounded-xl border-2 bg-transparent transition ${
                  currentImageIndex === index
                    ? "border-red-500"
                    : "border-transparent hover:border-white/30"
                }`}
              >
                <img
                  src={image}
                  alt=""
                  loading="lazy"
                  className="w-full h-full object-contain p-1"
                />
              </button>
            ))}
          </div>

          <div
            className="relative rounded-3xl overflow-hidden bg-transparent min-h-[400px] md:min-h-[500px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            tabIndex={0}
            onKeyDown={handleGalleryKey}
            role="group"
            aria-label="Imagen principal. Usa las flechas izquierda y derecha para navegar entre imagenes."
          >
            <img
              src={currentImage}
              alt={sneaker.name}
              className="max-w-full max-h-full w-full h-full object-contain"
            />
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Imagen anterior"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition z-10"
                >
                  <ChevronLeft size={22} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Siguiente imagen"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition z-10"
                >
                  <ChevronRight size={22} aria-hidden="true" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full" aria-live="polite">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
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

          {outOfStock && (
            <div
              className="mt-6 inline-flex items-center gap-2 bg-red-600/20 text-red-400 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wider"
              role="status"
            >
              <span
                className="w-2 h-2 rounded-full bg-red-500"
                aria-hidden="true"
              />
              Sin stock
            </div>
          )}

          {hasSizes && (
            <div className="mt-10">
              <h3 className="font-display text-xl font-bold mb-4 uppercase tracking-tight">
                Talles disponibles
              </h3>
              <div className="flex flex-wrap gap-3">
                {sizesWithStock
                  ? sneaker.sizes.map((entry, i) => {
                      const sizeStock = Number(entry.stock);
                      const isSizeOut = sizeStock === 0;
                      return (
                        <span
                          key={`${entry.size}-${i}`}
                          className={`border px-5 py-3 rounded-xl text-sm font-medium ${
                            isSizeOut
                              ? "border-zinc-800 text-zinc-600 line-through"
                              : "border-zinc-700 text-white"
                          }`}
                          aria-label={`Talle ${entry.size}${
                            isSizeOut ? " sin stock" : ""
                          }`}
                        >
                          {entry.size} US
                        </span>
                      );
                    })
                  : sizes.map((size) => (
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
            className={`mt-10 w-full px-8 py-4 rounded-2xl text-lg font-bold flex items-center justify-center gap-3 uppercase tracking-wider transition ${
              outOfStock
                ? "bg-zinc-800 hover:bg-zinc-700"
                : "bg-green-500 hover:bg-green-600"
            }`}
            aria-label={
              outOfStock ? "Consultar por WhatsApp" : "Pedir por WhatsApp"
            }
          >
            <MessageCircle size={22} aria-hidden="true" />
            {outOfStock ? "Consultar por WhatsApp" : "Pedir por WhatsApp"}
          </a>

          <p className="text-xs text-zinc-500 mt-3 text-center">
            Te respondemos a la brevedad con disponibilidad y medios de pago.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-16 grid md:grid-cols-2 gap-6">
        <ProsCons pros={sneaker.pros} cons={sneaker.cons} />
        {sneaker.review && <ReviewChart review={sneaker.review} />}
      </div>

      {sneaker.video && (
        <div className="max-w-7xl mx-auto px-6 pb-20">
          <video
            src={sneaker.video}
            controls
            preload="metadata"
            poster={sneaker.images?.[0]}
            className="w-full rounded-2xl"
          />
        </div>
      )}

      {related.length > 0 && (
        <section
          className="max-w-7xl mx-auto px-6 pb-20"
          aria-labelledby="related-heading"
        >
          <h2
            id="related-heading"
            className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight mb-6"
          >
            Productos relacionados
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((item) => (
              <SneakerCard key={item.id} sneaker={item} />
            ))}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
