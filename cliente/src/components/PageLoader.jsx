import { Loader } from "lucide-react";

export default function PageLoader() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center" role="status" aria-live="polite" aria-label="Cargando">
      <div className="flex flex-col items-center gap-4">
        <Loader className="text-red-500 animate-spin" size={40} />
        <p className="text-zinc-500 text-xs uppercase tracking-widest font-semibold">Cargando</p>
      </div>
    </div>
  );
}
