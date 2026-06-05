import { useCatalog } from "../hooks/useCatalog";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { Plus, Edit2, Trash2, LogOut, ShoppingBag, Search, X } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import { formatPrice } from "../config/contact";

export default function AdminDashboard() {
  const { sneakers, deleteSneaker, fetchSneakers } = useCatalog();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ brand: "", minPrice: "", maxPrice: "", minScore: "" });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSneakers();
  }, [fetchSneakers]);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error("Error en logout:", err);
    }
    logout();
    localStorage.removeItem("accessToken");
    navigate("/admin/login");
  };

  const getReviewAverage = (review) => {
    if (!review) return 0;
    const values = Object.values(review);
    return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
  };

  const clearFilters = () => {
    setFilters({ brand: "", minPrice: "", maxPrice: "", minScore: "" });
    setSearchTerm("");
  };

  const filteredSneakers = sneakers.filter((sneaker) => {
    const avgScore = getReviewAverage(sneaker.review);
    const matchesBrand = filters.brand === "" || sneaker.brand.toLowerCase().includes(filters.brand.toLowerCase());
    const matchesMinPrice = filters.minPrice === "" || sneaker.price >= Number(filters.minPrice);
    const matchesMaxPrice = filters.maxPrice === "" || sneaker.price <= Number(filters.maxPrice);
    const matchesScore = filters.minScore === "" || avgScore >= Number(filters.minScore);
    const matchesSearch = searchTerm === "" || sneaker.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesBrand && matchesMinPrice && matchesMaxPrice && matchesScore && matchesSearch;
  });

  const brands = [...new Set(sneakers.map((s) => s.brand))];

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />

      <div className="pt-24 px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <ShoppingBag size={32} />
            <h1 className="text-3xl font-bold">Dashboard</h1>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => navigate("/admin/nuevo")}
              className="bg-red-600 hover:bg-red-700 transition px-6 py-3 rounded-full font-semibold flex items-center gap-2"
            >
              <Plus size={20} />
              Nuevo Producto
            </button>

            <button
              onClick={handleLogout}
              className="bg-zinc-800 hover:bg-zinc-700 transition px-6 py-3 rounded-full font-semibold flex items-center gap-2"
            >
              <LogOut size={20} />
              Salir
            </button>
          </div>
        </div>

        <div className="bg-zinc-900 p-4 rounded-2xl border border-white/5 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm uppercase tracking-wider text-zinc-400 mb-2">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar producto..."
                  className="w-full bg-zinc-800 border border-white/10 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-red-500 transition"
                />
              </div>
            </div>

            <div className="w-[150px]">
              <label className="block text-sm uppercase tracking-wider text-zinc-400 mb-2">Marca</label>
              <select
                value={filters.brand}
                onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-red-500 transition"
              >
                <option value="">Todas</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            <div className="w-[120px]">
              <label className="block text-sm uppercase tracking-wider text-zinc-400 mb-2">Precio Mín</label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                placeholder="0"
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-red-500 transition"
              />
            </div>

            <div className="w-[120px]">
              <label className="block text-sm uppercase tracking-wider text-zinc-400 mb-2">Precio Máx</label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                placeholder="999999"
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-red-500 transition"
              />
            </div>

            <div className="w-[120px]">
              <label className="block text-sm uppercase tracking-wider text-zinc-400 mb-2">Score Mín</label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="10"
                value={filters.minScore}
                onChange={(e) => setFilters({ ...filters, minScore: e.target.value })}
                placeholder="1-10"
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-red-500 transition"
              />
            </div>

            <button
              onClick={clearFilters}
              className="bg-zinc-700 hover:bg-zinc-600 transition px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <X size={16} />
              Limpiar
            </button>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-2xl border border-white/5 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-zinc-400 font-medium uppercase tracking-wider">Producto</th>
                <th className="text-left p-4 text-zinc-400 font-medium uppercase tracking-wider">Marca</th>
                <th className="text-left p-4 text-zinc-400 font-medium uppercase tracking-wider">Precio</th>
                <th className="text-left p-4 text-zinc-400 font-medium uppercase tracking-wider">Score</th>
                <th className="text-left p-4 text-zinc-400 font-medium uppercase tracking-wider">Talles</th>
                <th className="text-right p-4 text-zinc-400 font-medium uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredSneakers.map((sneaker) => (
                <tr key={sneaker.id} className="border-b border-white/5 hover:bg-zinc-800/50 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={Array.isArray(sneaker.images) ? sneaker.images[0] : sneaker.image}
                        alt={sneaker.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <span className="font-medium">{sneaker.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-zinc-400">{sneaker.brand}</td>
                  <td className="p-4">${formatPrice(sneaker.price)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-sm ${getReviewAverage(sneaker.review) >= 8 ? "bg-green-600/20 text-green-500" : "bg-yellow-600/20 text-yellow-500"}`}>
                      {getReviewAverage(sneaker.review)}/10
                    </span>
                  </td>
                  <td className="p-4 text-zinc-400">{sneaker.sizes?.join(", ")}</td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => navigate(`/admin/editar/${sneaker.id}`)}
                        className="p-2 hover:bg-zinc-700 rounded-lg transition"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar "${sneaker.name}"?`)) {
                            deleteSneaker(sneaker.id);
                          }
                        }}
                        className="p-2 hover:bg-red-600/20 text-red-500 rounded-lg transition"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredSneakers.length === 0 && (
            <div className="p-12 text-center text-zinc-400">
              No hay productos que coincidan con los filtros
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}