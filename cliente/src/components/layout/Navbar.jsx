import { Menu, X, Shield } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { BRAND_NAME } from "../../config/contact";
import logoLight from "/logo.png";

const links = [
  { to: "/", label: "Inicio" },
  { to: "/zapatillas", label: "Zapatillas" },
  { to: "/nosotros", label: "Nosotros" },
  { to: "/como-comprar", label: "Cómo comprar" },
  { to: "/contacto", label: "Contacto" },
];

function isLinkActive(link, pathname) {
  if (link.to === "/") {
    return pathname === "/";
  }
  if (link.to === "/zapatillas") {
    return pathname === "/zapatillas" || pathname.startsWith("/zapatilla/");
  }
  return pathname === link.to;
}

function BrandMark() {
  return (
    <img
      src={logoLight}
      alt=""
      width={51}
      height={24}
      className="h-6 w-auto"
      aria-hidden="true"
    />
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAdmin } = useAuth();
  const location = useLocation();
  const menuButtonRef = useRef(null);
  const firstLinkRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    firstLinkRef.current?.focus();
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    const onClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !menuButtonRef.current?.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [menuOpen]);

  const toggleMenu = () => {
    setMenuOpen((prev) => {
      const next = !prev;
      if (!next) {
        menuButtonRef.current?.focus();
      }
      return next;
    });
  };

  const desktopLinkClass = (link) =>
    `hover:text-red-500 transition uppercase tracking-widest text-sm font-semibold ${
      isLinkActive(link, location.pathname) ? "text-red-500" : ""
    }`;

  const mobileLinkClass = (link) =>
    `hover:text-red-500 transition py-2 uppercase tracking-widest text-sm font-semibold ${
      isLinkActive(link, location.pathname) ? "text-red-500" : ""
    }`;

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-black/70 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center" onClick={() => setMenuOpen(false)} aria-label={`${BRAND_NAME} - Inicio`}>
          <BrandMark />
        </Link>

        <nav className="hidden md:flex gap-8" aria-label="Navegación principal">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={() => desktopLinkClass(link)}>
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
          ref={menuButtonRef}
          className="md:hidden p-1"
          onClick={toggleMenu}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {menuOpen && (
        <div
          id="mobile-menu"
          ref={menuRef}
          className="md:hidden bg-black/95 border-t border-white/10"
        >
          <nav className="flex flex-col p-6 gap-2" aria-label="Navegación móvil">
            {links.map((link, i) => (
              <NavLink
                key={link.to}
                to={link.to}
                ref={i === 0 ? firstLinkRef : undefined}
                className={() => mobileLinkClass(link)}
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
