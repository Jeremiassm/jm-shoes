import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchX, Package } from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import SneakerCard from "../components/sneakers/SneakerCard";
import SneakerCardSkeleton from "../components/sneakers/SneakerCardSkeleton";
import FilterBar from "../components/sneakers/FilterBar";
import SEO from "../components/SEO";
import { useCatalog } from "../hooks/useCatalog";
import { api } from "../lib/api";
import {
  DEFAULT_FILTERS,
  hasActiveFilters,
  readFiltersFromParams,
  filtersToParams,
} from "../lib/filters";

export default function Sneakers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { sneakers, loading, error, fetchSneakers, pagination } = useCatalog();
  const [brands, setBrands] = useState([]);

  const filters = useMemo(() => readFiltersFromParams(searchParams), [searchParams]);
  const active = useMemo(() => hasActiveFilters(filters), [filters]);

  useEffect(() => {
    fetchSneakers(filters).catch(() => {});
  }, [filters, fetchSneakers]);

  useEffect(() => {
    api.getBrands().then(setBrands).catch(() => setBrands([]));
  }, []);

  const handleFilterChange = (newFilters) => {
    setSearchParams(filtersToParams(newFilters), { replace: true });
  };

  const handleClearFilters = () => {
    setSearchParams(filtersToParams(DEFAULT_FILTERS), { replace: true });
  };

  return (
    <div className="bg-black min-h-screen text-white">
      <SEO
        title="Zapatillas - JM Shoes | Catalogo Completo"
        description="Explora nuestro catalogo completo de zapatillas de basketball. Filtra por marca, precio y puntuacion. Nike, Jordan y mas."
        keywords="catalogo zapatillas, comprar sneakers, nike basketball, zapatillas argentina"
      />
      <Navbar />

      <main id="main" className="pt-32 px-6 max-w-7xl mx-auto pb-20" role="main">
        <p className="text-red-500 uppercase tracking-widest text-sm font-semibold mb-3">
          Catalogo
        </p>
        <h1 className="font-display text-5xl md:text-6xl font-bold uppercase tracking-tight mb-4">
          Zapatillas
        </h1>
        <p className="text-zinc-400 mb-10 max-w-2xl">
          Modelos exclusivos para jugadores que buscan rendimiento y estilo. Filtra por marca, precio o puntuacion.
        </p>

        <FilterBar filters={filters} onFilterChange={handleFilterChange} brands={brands} />

        {error && (
          <p className="text-red-500 mb-6" role="alert">{error}</p>
        )}

        {loading && sneakers.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" role="status" aria-live="polite" aria-label="Cargando productos">
            {[...Array(6)].map((_, i) => (
              <SneakerCardSkeleton key={i} />
            ))}
          </div>
        ) : !loading && !error && sneakers.length === 0 ? (
          <EmptyState active={active} onClear={handleClearFilters} />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sneakers.map((sneaker) => (
                <SneakerCard key={sneaker.id} sneaker={sneaker} />
              ))}
            </div>
            {pagination.total > pagination.limit && (
              <p className="text-center text-zinc-500 text-sm mt-8">
                Mostrando {sneakers.length} de {pagination.total} productos
              </p>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

function EmptyState({ active, onClear }) {
  if (active) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto rounded-full bg-zinc-900 flex items-center justify-center mb-6">
          <SearchX className="text-red-500" size={36} aria-hidden="true" />
        </div>
        <h2 className="font-display text-3xl font-bold uppercase tracking-tight mb-2">
          Sin resultados
        </h2>
        <p className="text-zinc-400 max-w-md mx-auto">
          No encontramos productos que coincidan con los filtros aplicados. Proba ajustar los criterios o limpialos para ver todo el catalogo.
        </p>
        <button
          onClick={onClear}
          className="mt-6 bg-red-600 hover:bg-red-700 transition px-6 py-3 rounded-full font-semibold uppercase tracking-widest text-sm"
        >
          Limpiar filtros
        </button>
      </div>
    );
  }

  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 mx-auto rounded-full bg-zinc-900 flex items-center justify-center mb-6">
        <Package className="text-red-500" size={36} aria-hidden="true" />
      </div>
      <h2 className="font-display text-3xl font-bold uppercase tracking-tight mb-2">
        Catalogo vacio
      </h2>
      <p className="text-zinc-400 max-w-md mx-auto">
        Aun no hay productos cargados en el catalogo. Vuelve pronto para ver las ultimas zapatillas.
      </p>
    </div>
  );
}
