import { Menu, X, Shield } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { BRAND_NAME } from "../../config/contact";

const links = [
  { to: "/", label: "Inicio" },
  { to: "/zapatillas", label: "Zapatillas" },
  { to: "/como-comprar", label: "Cómo comprar" },
  { to: "/contacto", label: "Contacto" },
];

function BrandMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500" width="28" height="28">
      <path d="M3 16c1.5 1 3 1.5 5 1.5 1 0 2-.2 3-.5 1-.3 2-.5 3-.5 1.5 0 3 .3 4.5 1s3 1.2 4.5 1.2c.5 0 1 0 1.5-.2.3 0 .5-.3.5-.6 0-1.5-.5-3-1.5-4.5-.8-1.2-2-2-3.5-2.5-1-.3-2-.5-3-.5-1.5 0-3 .3-4.5 1S5 13 3.5 13c-.5 0-1 0-1.5-.2v3.2z" />
      <path d="M3 13c1.5 1 3 1.5 5 1.5" />
    </svg>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAdmin } = useAuth();

  const linkClass = ({ isActive }) =>
    `hover:text-red-500 transition uppercase tracking-widest text-sm font-semibold ${
      isActive ? "text-red-500" : ""
    }`;

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-black/70 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
          <BrandMark />
          <h1 className="font-display text-2xl font-bold tracking-tight">
            {BRAND_NAME}
          </h1>
        </Link>

        <nav className="hidden md:flex gap-8">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass} end={link.to === "/"}>
              {link.label}
            </NavLink>
          ))}

          {isAdmin && (
            <NavLink
              to="/admin/dashboard"
              className="flex items-center gap-1 text-zinc-500 hover:text-red-500 transition"
              title="Panel Admin"
            >
              <Shield size={16} />
            </NavLink>
          )}
        </nav>

        <button
          className="md:hidden p-1"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menú"
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-black/95 border-t border-white/10">
          <nav className="flex flex-col p-6 gap-2">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `hover:text-red-500 transition py-2 uppercase tracking-widest text-sm font-semibold ${
                    isActive ? "text-red-500" : ""
                  }`
                }
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}

            {isAdmin && (
              <NavLink
                to="/admin/dashboard"
                className="flex items-center gap-2 hover:text-red-500 transition py-2 uppercase tracking-widest text-sm font-semibold"
                onClick={() => setMenuOpen(false)}
              >
                <Shield size={16} />
                Admin
              </NavLink>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
