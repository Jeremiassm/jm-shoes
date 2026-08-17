import SneakerCard from "../sneakers/SneakerCard";
import { Eye } from "lucide-react";

export default function SneakerFormPreview({ sneaker }) {
  if (!sneaker) return null;

  return (
    <aside className="md:sticky md:top-28 md:self-start space-y-3 mt-6 md:mt-0">
      <div className="hidden md:flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-widest font-semibold">
        <Eye size={14} aria-hidden="true" />
        Preview en vivo
      </div>
      <p className="hidden md:block text-zinc-500 text-xs">
        Asi se ve tu producto en la pagina.
      </p>
      <div className="pointer-events-none">
        <SneakerCard sneaker={sneaker} />
      </div>
    </aside>
  );
}
