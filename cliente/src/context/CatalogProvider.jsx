import { useCallback, useEffect, useState } from "react";
import { CatalogContext } from "./CatalogContext";
import { api } from "../lib/api";
import { cleanFilters } from "../lib/filters";

export function CatalogProvider({ children }) {
  const [sneakers, setSneakers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 24, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSneakers = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getSneakers(cleanFilters(filters));
      const items = Array.isArray(data) ? data : data.items || [];
      setSneakers(items);
      if (data && !Array.isArray(data)) {
        setPagination({
          page: data.page,
          limit: data.limit,
          total: data.total,
          totalPages: data.totalPages,
        });
      } else {
        setPagination({ page: 1, limit: items.length, total: items.length, totalPages: 1 });
      }
      return data;
    } catch (err) {
      console.error("Error fetching sneakers:", err);
      setError("No se pudo conectar al servidor. Verifica tu conexion e intenta de nuevo.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFeatured = useCallback(async (limit = 6) => {
    try {
      const data = await api.getSneakers({ sortBy: "created_at", order: "desc", limit });
      return Array.isArray(data) ? data : data.items || [];
    } catch (err) {
      console.error("Error fetching featured:", err);
      return [];
    }
  }, []);

  useEffect(() => {
    fetchSneakers().catch(() => {});
  }, [fetchSneakers]);

  const addSneaker = async (sneaker) => {
    const created = await api.createSneaker(sneaker);
    setSneakers((prev) => [created, ...prev]);
    return created;
  };

  const updateSneaker = async (id, updated) => {
    const updatedSneaker = await api.updateSneaker(id, updated);
    setSneakers((prev) => prev.map((s) => (s.id === Number(id) ? updatedSneaker : s)));
    return updatedSneaker;
  };

  const deleteSneaker = async (id) => {
    await api.deleteSneaker(id);
    setSneakers((prev) => prev.filter((s) => s.id !== Number(id)));
  };

  const value = {
    sneakers,
    pagination,
    loading,
    error,
    fetchSneakers,
    fetchFeatured,
    addSneaker,
    updateSneaker,
    deleteSneaker,
  };

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}
