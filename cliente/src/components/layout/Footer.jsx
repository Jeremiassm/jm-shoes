import { Link } from "react-router-dom";
import { BRAND_NAME, EMAIL } from "../../config/contact";
import logoLight from "/logo.png";

const socialLinks = [
  {
    label: "Instagram",
    href: "https://instagram.com/jmshoes",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://facebook.com/jmshoes",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    label: "X (Twitter)",
    href: "https://twitter.com/jmshoes",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://tiktok.com/@jmshoes",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.55a8.16 8.16 0 0 0 4.77 1.52V6.62a4.85 4.85 0 0 1-1.84.07z"/>
      </svg>
    ),
  },
];

const navLinks = [
  { to: "/", label: "Inicio" },
  { to: "/zapatillas", label: "Zapatillas" },
  { to: "/nosotros", label: "Nosotros" },
  { to: "/como-comprar", label: "Cómo comprar" },
  { to: "/contacto", label: "Contacto" },
];

const helpLinks = [
  { to: "/como-comprar", label: "Cómo comprar" },
  { to: "/contacto", label: "Contacto" },
  { to: "/zapatillas", label: "Catálogo" },
  { to: "/nosotros", label: "Nosotros" },
];

export default function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4" aria-label={`${BRAND_NAME} - Inicio`}>
              <img src={logoLight} alt="" width={60} height={28} className="h-7 w-auto" aria-hidden="true" />
              <span className="font-display text-2xl font-bold tracking-tight">
                {BRAND_NAME}
              </span>
            </Link>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-md">
              Zapatillas exclusivas, desde Estados Unidos a Argentina en un solo paso.
            </p>
            <a
              href={`mailto:${EMAIL}`}
              className="text-zinc-400 hover:text-red-500 transition text-sm mt-4 inline-block"
            >
              {EMAIL}
            </a>
          </div>

          <div>
            <h3 className="font-display text-sm uppercase tracking-widest text-zinc-300 mb-4 font-bold">
              Navegación
            </h3>
            <ul className="space-y-2 text-zinc-400 text-sm">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="hover:text-red-500 transition">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm uppercase tracking-widest text-zinc-300 mb-4 font-bold">
              Ayuda
            </h3>
            <ul className="space-y-2 text-zinc-400 text-sm">
              {helpLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="hover:text-red-500 transition">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-red-600 transition text-zinc-300"
              >
                {social.icon}
              </a>
            ))}
          </div>
          <p className="text-zinc-500 text-xs">
            © {new Date().getFullYear()} {BRAND_NAME}. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
