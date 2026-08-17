import { MapPin, MessageCircle, Mail, CheckCircle } from "lucide-react";
import { useState } from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import SEO from "../components/SEO";
import { WHATSAPP_NUMBER, EMAIL, LOCATION, getWhatsAppLink, getEmailLink } from "../config/contact";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = form.name.trim() || "Visitante";
    const emailLine = form.email.trim() ? ` (${form.email.trim()})` : "";
    const message = `Hola! Soy ${name}${emailLine}.\n\n${form.message.trim()}`;
    window.open(getWhatsAppLink(message), "_blank", "noopener,noreferrer");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="bg-black min-h-screen text-white">
      <SEO
        title="Contacto - JM Shoes | WhatsApp y Email"
        description="Contactanos por WhatsApp o email. Estamos en Buenos Aires, Argentina. Respondemos todas tus consultas sobre zapatillas de basketball."
        keywords="contacto jm shoes, whatsapp zapatillas, email jm shoes, buenos aires"
      />
      <Navbar />

      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-red-500 uppercase tracking-widest text-sm font-semibold mb-4">
            Estamos para ayudarte
          </p>
          <h1 className="font-display text-5xl md:text-6xl font-bold uppercase tracking-tight">
            Contacto
          </h1>
          <p className="text-zinc-400 text-lg mt-4 mb-12 max-w-2xl">
            ¿Tenés alguna consulta sobre talles, disponibilidad o envíos? Escribinos y te respondemos a la brevedad.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <a
              href={getWhatsAppLink("Hola! Quiero consultar sobre unas zapatillas.")}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-zinc-900 p-6 rounded-2xl border border-white/5 hover:border-green-500/50 transition group"
            >
              <div className="w-12 h-12 rounded-full bg-green-600/20 flex items-center justify-center mb-4 group-hover:bg-green-600/30 transition">
                <MessageCircle className="text-green-500" size={22} />
              </div>
              <h3 className="font-display text-xl font-bold mb-1 uppercase tracking-tight">WhatsApp</h3>
              <p className="text-zinc-400 text-sm">Respuesta inmediata</p>
              <p className="text-white mt-3 font-medium">{WHATSAPP_NUMBER}</p>
            </a>

            <a
              href={getEmailLink()}
              className="bg-zinc-900 p-6 rounded-2xl border border-white/5 hover:border-red-500/50 transition group"
            >
              <div className="w-12 h-12 rounded-full bg-red-600/20 flex items-center justify-center mb-4 group-hover:bg-red-600/30 transition">
                <Mail className="text-red-500" size={22} />
              </div>
              <h3 className="font-display text-xl font-bold mb-1 uppercase tracking-tight">Email</h3>
              <p className="text-zinc-400 text-sm">Te respondemos en 24h</p>
              <p className="text-white mt-3 font-medium break-all">{EMAIL}</p>
            </a>

            <div className="bg-zinc-900 p-6 rounded-2xl border border-white/5">
              <div className="w-12 h-12 rounded-full bg-red-600/20 flex items-center justify-center mb-4">
                <MapPin className="text-red-500" size={22} />
              </div>
              <h3 className="font-display text-xl font-bold mb-1 uppercase tracking-tight">Ubicación</h3>
              <p className="text-zinc-400 text-sm">Envíos a todo el país</p>
              <p className="text-white mt-3 font-medium">{LOCATION}</p>
            </div>
          </div>

          <div className="bg-zinc-900 p-8 rounded-2xl border border-white/5">
            <h2 className="font-display text-3xl font-bold uppercase tracking-tight mb-2">
              Envianos un mensaje
            </h2>
            <p className="text-zinc-400 text-sm mb-6">
              Completá el formulario y te abrimos WhatsApp con tu mensaje listo para enviar.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2 font-semibold">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition"
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2 font-semibold">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition"
                  placeholder="tu@email.com"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2 font-semibold">
                  Mensaje
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition resize-none"
                  placeholder="¿En qué podemos ayudarte?"
                />
              </div>

              {submitted && (
                <div className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 p-3 rounded-lg">
                  <CheckCircle size={16} />
                  <span>Abriendo WhatsApp con tu mensaje...</span>
                </div>
              )}

              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 transition px-8 py-3 rounded-full font-semibold uppercase tracking-widest text-sm flex items-center gap-2"
              >
                <MessageCircle size={16} />
                Enviar por WhatsApp
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
