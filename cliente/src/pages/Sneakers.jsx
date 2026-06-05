import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import SneakerCard from "../components/sneakers/SneakerCard";
import FilterBar from "../components/sneakers/FilterBar";
import SEO from "../components/SEO";
import { useCatalog } from "../hooks/useCatalog";
import { useMemo } from "react";

export default function Sneakers() {
  const { sneakers, loading, error, fetchSneakers } = useCatalog();

  const brands = useMemo(() => {
    const uniqueBrands = [...new Set(sneakers.map((s) => s.brand).filter(Boolean))];
    return uniqueBrands.sort();
  }, [sneakers]);

  return (
    <div className="bg-black min-h-screen text-white">
      <SEO
        title="Zapatillas - JM Shoes | Catálogo Completo"
        description="Explorá nuestro catálogo completo de zapatillas de basketball. Filtrá por marca, precio y puntuación. Nike, Jordan y más."
        keywords="catálogo zapatillas, comprar sneakers, nike basketball, zapatillas argentina"
      />
      <Navbar />

      <div className="pt-32 px-6 max-w-7xl mx-auto pb-20">
        <p className="text-red-500 uppercase tracking-widest text-sm font-semibold mb-3">
          Catálogo
        </p>
        <h1 className="font-display text-5xl md:text-6xl font-bold uppercase tracking-tight mb-4">
          Zapatillas
        </h1>
        <p className="text-zinc-400 mb-10 max-w-2xl">
          Modelos exclusivos para jugadores que buscan rendimiento y estilo. Filtrá por marca, precio o puntuación.
        </p>

        <FilterBar onFilterChange={fetchSneakers} brands={brands} />

        {loading && (
          <p className="text-zinc-400">Cargando productos...</p>
        )}

        {error && (
          <p className="text-red-500">{error}</p>
        )}

        {!loading && !error && sneakers.length === 0 && (
          <p className="text-zinc-400">No se encontraron productos con los filtros aplicados.</p>
        )}

        {!loading && !error && sneakers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sneakers.map((sneaker) => (
              <SneakerCard key={sneaker.id} sneaker={sneaker} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
