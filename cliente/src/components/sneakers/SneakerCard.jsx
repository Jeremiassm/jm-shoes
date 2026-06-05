import { useState } from "react";
import { Link } from "react-router-dom";
import { formatPrice } from "../../config/contact";

export default function SneakerCard({ sneaker }) {
  const [imgError, setImgError] = useState(false);
  const imageUrl = Array.isArray(sneaker.images) ? sneaker.images[0] : sneaker.image;
  const fallback = "https://via.placeholder.com/600x400/18181b/52525b?text=JM+Shoes";

  return (
    <Link to={`/zapatilla/${sneaker.id}`} className="block" aria-label={`Ver ${sneaker.name}`}>
      <div className="group bg-zinc-900 rounded-3xl overflow-hidden border border-white/5 hover:border-red-500/40 transition cursor-pointer h-full flex flex-col">
        <div className="overflow-hidden bg-zinc-800">
          <img
            src={imgError ? fallback : imageUrl}
            alt={sneaker.name}
            onError={() => setImgError(true)}
            loading="lazy"
            className="w-full h-72 object-cover group-hover:scale-110 transition duration-500"
          />
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
              ${formatPrice(sneaker.price)}
            </span>
            <span className="bg-red-600 group-hover:bg-red-700 transition px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest">
              Ver más
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
