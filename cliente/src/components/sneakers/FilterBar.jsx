import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { SORT_OPTIONS, hasActiveFilters, debounce } from "../../lib/filters";

export default function FilterBar({ filters, onFilterChange, brands = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [local, setLocal] = useState({
    search: filters.search || "",
    brand: filters.brand || "",
    minPrice: filters.minPrice || "",
    maxPrice: filters.maxPrice || "",
    minRating: filters.minRating || "",
    sortBy: filters.sortBy || "created_at",
    order: filters.order || "desc",
  });

  // Mantener `local` sincronizado cuando cambian los filtros desde afuera
  // (ej. "Limpiar filtros").
  useEffect(() => {
    setLocal({
      search: filters.search || "",
      brand: filters.brand || "",
      minPrice: filters.minPrice || "",
      maxPrice: filters.maxPrice || "",
      minRating: filters.minRating || "",
      sortBy: filters.sortBy || "created_at",
      order: filters.order || "desc",
    });
  }, [filters]);

  // Debounce para todos los cambios
  const push = useMemo(
    () =>
      debounce((next) => {
        onFilterChange({ ...filters, ...next });
      }, 350),
    [filters, onFilterChange]
  );

  useEffect(() => () => push.cancel(), [push]);

  const handle = (key, value) => {
    setLocal((prev) => ({ ...prev, [key]: value }));
    push({ [key]: value });
  };

  const clearFilters = () => {
    setLocal({ search: "", brand: "", minPrice: "", maxPrice: "", minRating: "", sortBy: "created_at", order: "desc" });
    onFilterChange({ sortBy: "created_at", order: "desc" });
  };

  const active = hasActiveFilters(local);
  const panelId = "filter-panel";

  return (
    <div className="mb-8">
      <div className="flex gap-4 items-center mb-4 flex-wrap">
        <div className="flex-1 relative min-w-[200px]">
          <label htmlFor="filter-search" className="sr-only">Buscar</label>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} aria-hidden="true" />
          <input
            id="filter-search"
            type="search"
            value={local.search}
            onChange={(e) => handle("search", e.target.value)}
            placeholder="Buscar por nombre, marca o descripcion..."
            className="w-full bg-zinc-800 border border-white/10 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-red-500 transition"
          />
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition ${
            isOpen ? "bg-red-600 border-red-600" : "bg-zinc-800 border-white/10 hover:border-red-500"
          }`}
          aria-expanded={isOpen}
          aria-controls={panelId}
        >
          <SlidersHorizontal size={18} aria-hidden="true" />
          Filtros
        </button>

        {active && (
          <button
            type="button"
            onClick={clearFilters}
            className="flex items-center gap-2 px-4 py-3 rounded-lg bg-zinc-800 border border-white/10 hover:border-red-500 transition"
          >
            <X size={18} aria-hidden="true" />
            Limpiar
          </button>
        )}
      </div>

      {isOpen && (
        <div
          id={panelId}
          className="bg-zinc-900 p-6 rounded-2xl border border-white/5 space-y-4"
        >
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="filter-brand" className="block text-xs uppercase tracking-widest text-zinc-400 mb-2 font-semibold">Marca</label>
              <select
                id="filter-brand"
                value={local.brand}
                onChange={(e) => handle("brand", e.target.value)}
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition"
              >
                <option value="">Todas</option>
                {brands.map((b) => (
                  <option key={b.slug || b.name} value={b.slug || b.name}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="filter-min-price" className="block text-xs uppercase tracking-widest text-zinc-400 mb-2 font-semibold">Precio Minimo</label>
              <input
                id="filter-min-price"
                type="number"
                inputMode="numeric"
                min="0"
                value={local.minPrice}
                onChange={(e) => handle("minPrice", e.target.value)}
                placeholder="0"
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition"
              />
            </div>

            <div>
              <label htmlFor="filter-max-price" className="block text-xs uppercase tracking-widest text-zinc-400 mb-2 font-semibold">Precio Maximo</label>
              <input
                id="filter-max-price"
                type="number"
                inputMode="numeric"
                min="0"
                value={local.maxPrice}
                onChange={(e) => handle("maxPrice", e.target.value)}
                placeholder="999999"
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition"
              />
            </div>

            <div>
              <label htmlFor="filter-min-rating" className="block text-xs uppercase tracking-widest text-zinc-400 mb-2 font-semibold">Puntuacion Minima</label>
              <select
                id="filter-min-rating"
                value={local.minRating}
                onChange={(e) => handle("minRating", e.target.value)}
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition"
              >
                <option value="">Cualquiera</option>
                <option value="7">7+</option>
                <option value="8">8+</option>
                <option value="9">9+</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="filter-sort" className="block text-xs uppercase tracking-widest text-zinc-400 mb-2 font-semibold">Ordenar por</label>
              <select
                id="filter-sort"
                value={local.sortBy}
                onChange={(e) => handle("sortBy", e.target.value)}
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="filter-order" className="block text-xs uppercase tracking-widest text-zinc-400 mb-2 font-semibold">Orden</label>
              <select
                id="filter-order"
                value={local.order}
                onChange={(e) => handle("order", e.target.value)}
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition"
              >
                <option value="desc">Descendente</option>
                <option value="asc">Ascendente</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
