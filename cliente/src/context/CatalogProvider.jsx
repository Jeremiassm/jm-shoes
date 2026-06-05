import { useState, useEffect, useCallback } from "react";
import { CatalogContext } from "./CatalogContext";
import { api } from "../lib/api";

export function CatalogProvider({ children }) {
  const [sneakers, setSneakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSneakers = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      const response = await api.getSneakers(filters);
      setSneakers(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching sneakers:", err);
      setError("No se pudo conectar al servidor. Verificá tu conexión e intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSneakers();
  }, [fetchSneakers]);

  const addSneaker = async (sneaker) => {
    const response = await api.createSneaker(sneaker);
    setSneakers((prev) => [...prev, response.data]);
    return response.data;
  };

  const updateSneaker = async (id, updatedSneaker) => {
    const response = await api.updateSneaker(id, updatedSneaker);
    setSneakers((prev) =>
      prev.map((s) => (s.id === Number(id) ? response.data : s))
    );
    return response.data;
  };

  const deleteSneaker = async (id) => {
    await api.deleteSneaker(id);
    setSneakers((prev) => prev.filter((s) => s.id !== Number(id)));
  };

  const value = { sneakers, loading, error, fetchSneakers, addSneaker, updateSneaker, deleteSneaker };

  return (
    <CatalogContext.Provider value={value}>
      {children}
    </CatalogContext.Provider>
  );
}
