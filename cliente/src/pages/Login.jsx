import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { Lock, User, AlertCircle } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await api.login(username, password);
      if (response.data.success) {
        login();
        localStorage.setItem("accessToken", response.data.accessToken);
        navigate("/admin/dashboard");
      }
    } catch {
      setError("Credenciales inválidas. Verificá e intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black min-h-screen text-white flex flex-col">
      <Navbar />

      <div className="flex-1 pt-32 px-6 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="bg-zinc-900 p-8 rounded-3xl border border-white/5">
            <div className="flex justify-center mb-6">
              <div className="bg-red-600/20 p-4 rounded-full">
                <Lock className="text-red-500" size={32} />
              </div>
            </div>

            <h1 className="font-display text-3xl font-bold text-center uppercase tracking-tight">
              Panel de Administración
            </h1>
            <p className="text-zinc-400 text-center mt-2 mb-8">
              Ingresá tus credenciales para continuar
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Usuario"
                  required
                  className={`w-full bg-zinc-800 border ${error ? "border-red-500" : "border-white/10"} rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-red-500 transition`}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña"
                  required
                  className={`w-full bg-zinc-800 border ${error ? "border-red-500" : "border-white/10"} rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-red-500 transition`}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 p-3 rounded-lg">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 transition py-3 rounded-full font-semibold uppercase tracking-widest text-sm disabled:opacity-50"
              >
                {loading ? "Verificando..." : "Ingresar"}
              </button>
            </form>

            <p className="text-zinc-500 text-xs text-center mt-6">
              Usuario por defecto: <code className="text-zinc-300">admin</code> · Contraseña: <code className="text-zinc-300">admin123</code>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
