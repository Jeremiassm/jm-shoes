import { useState } from "react";
import { Link } from "react-router-dom";
import { formatPrice } from "../../config/contact";
import { isInStock, getReviewAverage } from "../../lib/sneakers";

const FALLBACK_IMG = "/placeholder-sneaker.webp";

function getCardImage(sneaker) {
  // Priorizar thumb devuelto por el upload; caer a la imagen principal.
  return sneaker.thumbUrl || sneaker.images?.[0] || sneaker.image || FALLBACK_IMG;
}

export default function SneakerCard({ sneaker, priority = false }) {
  const [imgError, setImgError] = useState(false);
  const imageUrl = getCardImage(sneaker);
  const inStock = isInStock(sneaker);
  const score = getReviewAverage(sneaker);

  return (
    <Link
      to={`/zapatilla/${sneaker.slug || sneaker.id}`}
      className="block group"
      aria-label={`Ver ${sneaker.name}`}
    >
      <article className="bg-zinc-900 rounded-3xl overflow-hidden border border-white/5 hover:border-red-500/40 transition h-full flex flex-col">
        <div className="overflow-hidden bg-zinc-800 relative aspect-square">
          <img
            src={imgError ? FALLBACK_IMG : imageUrl}
            alt={sneaker.name}
            onError={() => setImgError(true)}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            decoding="async"
            width={600}
            height={600}
            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
          />
          {!inStock && (
            <span className="absolute top-3 right-3 bg-red-600/90 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
              Sin stock
            </span>
          )}
        </div>

        <div className="p-5 flex flex-col flex-1">
          <p className="text-zinc-400 text-xs uppercase tracking-widest font-semibold">
            {sneaker.brand}
          </p>

          <h3 className="font-display text-2xl font-bold mt-1 tracking-tight">
            {sneaker.name}
          </h3>

          <div className="flex items-center justify-between mt-auto pt-5">
            <span className="text-xl font-semibold font-display">
              {formatPrice(sneaker.price)}
            </span>
            <span className="bg-red-600 group-hover:bg-red-700 transition px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest">
              Ver mas
            </span>
          </div>

          {score > 0 && (
            <p className="text-zinc-500 text-xs mt-2" aria-label={`Puntuacion ${score} de 10`}>
              {score}/10
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}
