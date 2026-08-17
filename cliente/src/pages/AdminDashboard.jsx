import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Edit2,
  LogOut,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { useToast } from "../hooks/useToast";
import { api } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import { formatPrice } from "../config/contact";
import { cleanFilters } from "../lib/filters";
import { getReviewAverage } from "../lib/sneakers";

const FALLBACK_IMG = "/placeholder-sneaker.webp";
const ADMIN_PAGE_LIMIT = 100;

function getThumb(sneaker) {
  return sneaker.thumbUrl || sneaker.images?.[0] || sneaker.image || FALLBACK_IMG;
}

function getSizesText(sneaker) {
  if (!Array.isArray(sneaker.sizes)) return "";
  return sneaker.sizes
    .map((s) => (typeof s === "object" && s !== null ? s.size : s))
    .filter((s) => s !== undefined && s !== null && s !== "")
    .join(", ");
}

function getScoreClass(score) {
  return score >= 8
    ? "bg-green-600/20 text-green-500"
    : "bg-yellow-600/20 text-yellow-500";
}

function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Eliminar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
  busy = false,
}) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape" && !busy) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy, onCancel]);

  useEffect(() => {
    if (open && !busy) {
      const btn = document.getElementById("confirm-dialog-cancel");
      if (btn) btn.focus();
    }
  }, [open, busy]);

  if (!open) return null;

  const titleId = "confirm-dialog-title";
  const descId = "confirm-dialog-desc";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={() => !busy && onCancel()}
      role="presentation"
    >
      <div
        className="bg-zinc-900 border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="text-red-500" size={20} aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h2 id={titleId} className="text-lg font-bold">
              {title}
            </h2>
            <p id={descId} className="text-zinc-400 mt-2 text-sm">
              {message}
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            id="confirm-dialog-cancel"
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            aria-busy={busy}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { showToast } = useToast();

  const [sneakers, setSneakers] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState({
    brand: "",
    minPrice: "",
    maxPrice: "",
    minRating: "",
  });
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const requestFilters = useMemo(
    () => cleanFilters({ search: debouncedSearch, limit: ADMIN_PAGE_LIMIT, ...filters }),
    [debouncedSearch, filters]
  );

  const loadSneakers = useCallback(
    async (params) => {
      setLoading(true);
      try {
        const data = await api.getSneakers(params);
        const items = Array.isArray(data) ? data : data.items || [];
        setSneakers(items);
      } catch (err) {
        console.error("Error al cargar productos:", err);
        showToast("No se pudieron cargar los productos.", "error");
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    loadSneakers(requestFilters);
  }, [requestFilters, loadSneakers]);

  useEffect(() => {
    api.getBrands().then(setBrands).catch(() => setBrands([]));
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error("Error en logout:", err);
    }
    logout();
    localStorage.removeItem("accessToken");
    navigate("/admin/login");
  }, [logout, navigate]);

  const clearFilters = useCallback(() => {
    setFilters({ brand: "", minPrice: "", maxPrice: "", minRating: "" });
    setSearchInput("");
  }, []);

  const requestDelete = useCallback((sneaker) => {
    setConfirmTarget(sneaker);
  }, []);

  const cancelDelete = useCallback(() => {
    if (deleting) return;
    setConfirmTarget(null);
  }, [deleting]);

  const confirmDelete = useCallback(async () => {
    if (!confirmTarget) return;
    setDeleting(true);
    try {
      await api.deleteSneaker(confirmTarget.id);
      setSneakers((prev) => prev.filter((s) => s.id !== confirmTarget.id));
      showToast(`"${confirmTarget.name}" se elimino correctamente.`, "success");
      setConfirmTarget(null);
    } catch (err) {
      console.error("Error al eliminar:", err);
      showToast("No se pudo eliminar el producto.", "error");
    } finally {
      setDeleting(false);
    }
  }, [confirmTarget, showToast]);

  const showInitialSkeleton = loading && sneakers.length === 0;

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />

      <div className="pt-24 px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <ShoppingBag size={32} aria-hidden="true" />
            <h1 className="text-3xl font-bold">Dashboard</h1>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate("/admin/nuevo")}
              className="bg-red-600 hover:bg-red-700 transition px-6 py-3 rounded-full font-semibold flex items-center gap-2"
            >
              <Plus size={20} aria-hidden="true" />
              Nuevo Producto
            </button>

            <button
              type="button"
              onClick={handleLogout}
              aria-label="Cerrar sesion"
              className="bg-zinc-800 hover:bg-zinc-700 transition px-6 py-3 rounded-full font-semibold flex items-center gap-2"
            >
              <LogOut size={20} aria-hidden="true" />
              Salir
            </button>
          </div>
        </div>

        <div className="bg-zinc-900 p-4 rounded-2xl border border-white/5 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label
                htmlFor="admin-search"
                className="block text-sm uppercase tracking-wider text-zinc-400 mb-2"
              >
                Buscar
              </label>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                  size={18}
                  aria-hidden="true"
                />
                <input
                  id="admin-search"
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Buscar producto..."
                  aria-label="Buscar producto"
                  className="w-full bg-zinc-800 border border-white/10 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-red-500 transition"
                />
              </div>
            </div>

            <div className="w-[150px]">
              <label
                htmlFor="admin-brand"
                className="block text-sm uppercase tracking-wider text-zinc-400 mb-2"
              >
                Marca
              </label>
              <select
                id="admin-brand"
                value={filters.brand}
                onChange={(e) => setFilters((f) => ({ ...f, brand: e.target.value }))}
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-red-500 transition"
              >
                <option value="">Todas</option>
                {brands.map((brand) => (
                  <option key={brand.slug || brand.name} value={brand.name}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-[120px]">
              <label
                htmlFor="admin-min-price"
                className="block text-sm uppercase tracking-wider text-zinc-400 mb-2"
              >
                Precio Min
              </label>
              <input
                id="admin-min-price"
                type="number"
                value={filters.minPrice}
                onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))}
                placeholder="0"
                aria-label="Precio minimo"
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-red-500 transition"
              />
            </div>

            <div className="w-[120px]">
              <label
                htmlFor="admin-max-price"
                className="block text-sm uppercase tracking-wider text-zinc-400 mb-2"
              >
                Precio Max
              </label>
              <input
                id="admin-max-price"
                type="number"
                value={filters.maxPrice}
                onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))}
                placeholder="999999"
                aria-label="Precio maximo"
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-red-500 transition"
              />
            </div>

            <div className="w-[120px]">
              <label
                htmlFor="admin-min-rating"
                className="block text-sm uppercase tracking-wider text-zinc-400 mb-2"
              >
                Puntuacion Min
              </label>
              <input
                id="admin-min-rating"
                type="number"
                step="0.1"
                min="1"
                max="10"
                value={filters.minRating}
                onChange={(e) => setFilters((f) => ({ ...f, minRating: e.target.value }))}
                placeholder="1-10"
                aria-label="Puntuacion minima"
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-red-500 transition"
              />
            </div>

            <button
              type="button"
              onClick={clearFilters}
              className="bg-zinc-700 hover:bg-zinc-600 transition px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <X size={16} aria-hidden="true" />
              Limpiar
            </button>
          </div>
        </div>

        <div
          className="bg-zinc-900 rounded-2xl border border-white/5 overflow-hidden"
          aria-busy={loading}
        >
          {showInitialSkeleton ? (
            <div
              role="status"
              aria-live="polite"
              aria-busy="true"
              aria-label="Cargando productos"
            >
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 border-b border-white/5 last:border-b-0"
                >
                  <div className="w-12 h-12 rounded-lg bg-zinc-800 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/3 bg-zinc-800 rounded animate-pulse" />
                    <div className="h-3 w-1/4 bg-zinc-800 rounded animate-pulse" />
                  </div>
                  <div className="hidden md:block w-20 h-4 bg-zinc-800 rounded animate-pulse" />
                  <div className="hidden md:block w-16 h-4 bg-zinc-800 rounded animate-pulse" />
                  <div className="hidden md:block w-24 h-4 bg-zinc-800 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="sr-only" role="status" aria-live="polite">
                {loading ? "Cargando productos" : ""}
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-zinc-400 font-medium uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="text-left p-4 text-zinc-400 font-medium uppercase tracking-wider">
                      Marca
                    </th>
                    <th className="text-left p-4 text-zinc-400 font-medium uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="text-left p-4 text-zinc-400 font-medium uppercase tracking-wider">
                      Score
                    </th>
                    <th className="text-left p-4 text-zinc-400 font-medium uppercase tracking-wider">
                      Talles
                    </th>
                    <th className="text-right p-4 text-zinc-400 font-medium uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sneakers.map((sneaker) => {
                    const score = getReviewAverage(sneaker);
                    return (
                      <tr
                        key={sneaker.id}
                        className="border-b border-white/5 hover:bg-zinc-800/50 transition"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={getThumb(sneaker)}
                              alt={sneaker.name}
                              className="w-12 h-12 object-cover rounded-lg"
                              loading="lazy"
                              width={48}
                              height={48}
                            />
                            <span className="font-medium">{sneaker.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-zinc-400">{sneaker.brand}</td>
                        <td className="p-4">{formatPrice(sneaker.price)}</td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-1 rounded text-sm ${getScoreClass(score)}`}
                            aria-label={`Puntuacion ${score} de 10`}
                          >
                            {score}/10
                          </span>
                        </td>
                        <td className="p-4 text-zinc-400">{getSizesText(sneaker)}</td>
                        <td className="p-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => navigate(`/admin/editar/${sneaker.id}`)}
                              className="p-2 hover:bg-zinc-700 rounded-lg transition"
                              title="Editar"
                              aria-label={`Editar ${sneaker.name}`}
                            >
                              <Edit2 size={18} aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() => requestDelete(sneaker)}
                              className="p-2 hover:bg-red-600/20 text-red-500 rounded-lg transition"
                              title="Eliminar"
                              aria-label={`Eliminar ${sneaker.name}`}
                            >
                              <Trash2 size={18} aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {sneakers.length === 0 && !loading && (
                <div className="p-12 text-center text-zinc-400">
                  No hay productos que coincidan con los filtros
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />

      <ConfirmDialog
        open={Boolean(confirmTarget)}
        title="Eliminar producto"
        message={
          confirmTarget
            ? `¿Eliminar "${confirmTarget.name}"? Esta accion no se puede deshacer.`
            : ""
        }
        confirmLabel={deleting ? "Eliminando..." : "Eliminar"}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        busy={deleting}
      />
    </div>
  );
}
