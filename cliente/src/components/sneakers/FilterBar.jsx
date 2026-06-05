import { useState, useEffect, useRef, useCallback } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

export default function FilterBar({ onFilterChange, brands = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [order, setOrder] = useState("desc");
  const debounceRef = useRef(null);

  const buildFilters = useCallback(() => {
    const filters = { sortBy, order };
    if (search) filters.search = search;
    if (brand) filters.brand = brand;
    if (minPrice) filters.minPrice = minPrice;
    if (maxPrice) filters.maxPrice = maxPrice;
    if (minRating) filters.minRating = minRating;
    return filters;
  }, [search, brand, minPrice, maxPrice, minRating, sortBy, order]);

  useEffect(() => {
    onFilterChange(buildFilters());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brand, minPrice, maxPrice, minRating, sortBy, order]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onFilterChange({ ...buildFilters(), search: value });
    }, 300);
  };

  const clearFilters = () => {
    setSearch("");
    setBrand("");
    setMinPrice("");
    setMaxPrice("");
    setMinRating("");
    setSortBy("created_at");
    setOrder("desc");
    onFilterChange({ sortBy: "created_at", order: "desc" });
  };

  const hasActiveFilters = search || brand || minPrice || maxPrice || minRating;

  return (
    <div className="mb-8">
      <div className="flex gap-4 items-center mb-4 flex-wrap">
        <div className="flex-1 relative min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Buscar por nombre, marca o descripción..."
            className="w-full bg-zinc-800 border border-white/10 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-red-500 transition"
          />
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition ${
            isOpen ? "bg-red-600 border-red-600" : "bg-zinc-800 border-white/10 hover:border-red-500"
          }`}
        >
          <SlidersHorizontal size={18} />
          Filtros
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-4 py-3 rounded-lg bg-zinc-800 border border-white/10 hover:border-red-500 transition"
          >
            <X size={18} />
            Limpiar
          </button>
        )}
      </div>

      {isOpen && (
        <div className="bg-zinc-900 p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2 font-semibold">Marca</label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition"
              >
                <option value="">Todas</option>
                {brands.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2 font-semibold">Precio Mínimo</label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="0"
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2 font-semibold">Precio Máximo</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="999999"
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2 font-semibold">Puntuación Mínima</label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
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
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2 font-semibold">Ordenar por</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition"
              >
                <option value="created_at">Más recientes</option>
                <option value="price">Precio</option>
                <option value="name">Nombre</option>
                <option value="rating">Puntuación</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2 font-semibold">Orden</label>
              <select
                value={order}
                onChange={(e) => setOrder(e.target.value)}
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
