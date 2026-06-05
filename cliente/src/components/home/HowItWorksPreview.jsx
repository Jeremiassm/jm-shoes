import { Search, MessageCircle, CreditCard, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { getWhatsAppLink } from "../../config/contact";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Explorá el catálogo",
    description: "Filtrá por marca, talle o precio. Encontrá tu modelo ideal.",
  },
  {
    number: "02",
    icon: MessageCircle,
    title: "Escribinos por WhatsApp",
    description: "Te asesoramos personalmente y confirmamos disponibilidad.",
  },
  {
    number: "03",
    icon: CreditCard,
    title: "Elegí cómo pagar",
    description: "Transferencia, efectivo o MercadoPago. Coordinamos todo.",
  },
  {
    number: "04",
    icon: Package,
    title: "Recibí en tu casa",
    description: "Preparamos tu pedido y lo enviamos a cualquier punto del país.",
  },
];

export default function HowItWorksPreview() {
  return (
    <section className="bg-zinc-950 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-red-500 uppercase tracking-widest text-sm font-semibold mb-3">
            Proceso simple
          </p>
          <h2 className="font-display text-5xl md:text-6xl font-bold uppercase tracking-tight">
            Cómo comprar
          </h2>
          <p className="text-zinc-400 mt-4 max-w-xl mx-auto">
            En 4 pasos simples tenés tus zapatillas exclusivas en tus manos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative bg-zinc-900 rounded-3xl p-6 border border-white/5 hover:border-red-500/30 transition group"
              >
                <span className="font-display text-6xl font-bold text-zinc-800 absolute top-4 right-6 group-hover:text-red-900/40 transition">
                  {step.number}
                </span>
                <div className="w-14 h-14 rounded-2xl bg-red-600/15 flex items-center justify-center mb-4 group-hover:bg-red-600/25 transition">
                  <Icon className="text-red-500" size={26} />
                </div>
                <h3 className="font-display text-xl font-bold uppercase tracking-tight mt-8">
                  {step.title}
                </h3>
                <p className="text-zinc-400 text-sm mt-2 leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            to="/como-comprar"
            className="bg-red-600 hover:bg-red-700 transition px-8 py-4 rounded-full font-semibold uppercase tracking-widest text-sm"
          >
            Ver guía completa
          </Link>
          <a
            href={getWhatsAppLink("Hola! Quiero consultar sobre unas zapatillas.")}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-white/20 hover:border-white/60 hover:bg-white/5 transition px-8 py-4 rounded-full font-semibold uppercase tracking-widest text-sm"
          >
            Escribinos por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
