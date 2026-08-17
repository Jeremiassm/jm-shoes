import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Package } from "lucide-react";
import { useCatalog } from "../../hooks/useCatalog";
import SneakerCard from "../sneakers/SneakerCard";
import SneakerCardSkeleton from "../sneakers/SneakerCardSkeleton";

export default function FeaturedSneakers() {
  const { sneakers, loading } = useCatalog();

  const latest = useMemo(
    () =>
      [...sneakers]
        .sort((a, b) => {
          const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return db - da;
        })
        .slice(0, 3),
    [sneakers]
  );

  return (
    <section className="max-w-7xl mx-auto px-6 py-24" aria-labelledby="featured-heading">
      <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
        <div>
          <h2
            id="featured-heading"
            className="font-display text-5xl md:text-6xl font-bold uppercase tracking-tight"
          >
            Últimos modelos
          </h2>
        </div>
        <Link
          to="/zapatillas"
          className="flex items-center gap-2 text-zinc-300 hover:text-red-500 transition text-sm uppercase tracking-widest font-semibold"
        >
          Ver todas
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>

      {loading && sneakers.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" role="status" aria-live="polite" aria-label="Cargando productos">
          {[...Array(3)].map((_, i) => (
            <SneakerCardSkeleton key={i} />
          ))}
        </div>
      ) : latest.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto rounded-full bg-zinc-900 flex items-center justify-center mb-4">
            <Package className="text-red-500" size={28} aria-hidden="true" />
          </div>
          <p className="text-zinc-400">Aun no hay productos cargados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {latest.map((sneaker) => (
            <SneakerCard key={sneaker.id} sneaker={sneaker} priority={true} />
          ))}
        </div>
      )}
    </section>
  );
}
