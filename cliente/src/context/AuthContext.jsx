import { createContext, useCallback, useSyncExternalStore } from "react";

const ADMIN_STORAGE_KEY = "jmshoes_admin";
const ACCESS_TOKEN_KEY = "accessToken";

function readFlag() {
  try {
    return localStorage.getItem(ADMIN_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

const listeners = new Set();
let currentFlag = readFlag();

function subscribe(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return currentFlag;
}

function getServerSnapshot() {
  return false;
}

function notify() {
  for (const cb of listeners) cb();
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === ADMIN_STORAGE_KEY || e.key === ACCESS_TOKEN_KEY) {
      currentFlag = readFlag();
      notify();
    }
  });
  window.addEventListener("jmshoes:auth", () => {
    currentFlag = readFlag();
    notify();
  });
}

const AuthContext = createContext({
  isAdmin: false,
  login: () => {},
  logout: () => {},
});

export { AuthContext };

export function AuthProvider({ children }) {
  const isAdmin = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const login = useCallback(() => {
    localStorage.setItem(ADMIN_STORAGE_KEY, "true");
    currentFlag = true;
    notify();
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    currentFlag = false;
    notify();
  }, []);

  return (
    <AuthContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
