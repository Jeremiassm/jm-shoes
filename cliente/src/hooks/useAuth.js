import { useState, useEffect } from "react";

const ADMIN_STORAGE_KEY = "jmshoes_admin";

function readAdminFlag() {
  try {
    return localStorage.getItem(ADMIN_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function useAuth() {
  const [isAdmin, setIsAdmin] = useState(readAdminFlag);

  useEffect(() => {
    const onStorage = () => setIsAdmin(readAdminFlag());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return {
    isAdmin,
    login: () => {
      localStorage.setItem(ADMIN_STORAGE_KEY, "true");
      setIsAdmin(true);
    },
    logout: () => {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
      setIsAdmin(false);
    },
  };
}
