import { useCatalog } from "../../hooks/useCatalog";
import SneakerCard from "../sneakers/SneakerCard";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function FeaturedSneakers() {
  const { sneakers, loading } = useCatalog();

  const latestSneakers = [...sneakers]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  return (
    <section className="max-w-7xl mx-auto px-6 py-24">
      <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
        <div>
          <p className="text-red-500 uppercase tracking-widest text-sm font-semibold">
            Exclusivas
          </p>
          <h2 className="font-display text-5xl md:text-6xl font-bold mt-2 uppercase tracking-tight">
            Featured Sneakers
          </h2>
        </div>
        <Link
          to="/zapatillas"
          className="flex items-center gap-2 text-zinc-300 hover:text-red-500 transition text-sm uppercase tracking-widest font-semibold"
        >
          Ver todas
          <ArrowRight size={16} />
        </Link>
      </div>

      {loading && sneakers.length === 0 ? (
        <p className="text-zinc-400">Cargando productos...</p>
      ) : latestSneakers.length === 0 ? (
        <p className="text-zinc-400">Aún no hay productos cargados.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {latestSneakers.map((sneaker) => (
            <SneakerCard key={sneaker.id} sneaker={sneaker} />
          ))}
        </div>
      )}
    </section>
  );
}