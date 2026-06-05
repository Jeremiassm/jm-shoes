import { Truck, ShieldCheck, BadgeCheck, MessageSquare } from "lucide-react";

const items = [
  {
    icon: Truck,
    title: "Envíos a todo el país",
    description: "Recibí tu pedido en cualquier punto de Argentina",
  },
  {
    icon: ShieldCheck,
    title: "Pago 100% seguro",
    description: "Transferencia, efectivo o MercadoPago",
  },
  {
    icon: BadgeCheck,
    title: "Productos originales",
    description: "Traídos directamente de Estados Unidos",
  },
  {
    icon: MessageSquare,
    title: "Asesoría personalizada",
    description: "Te ayudamos a elegir el talle y modelo ideal",
  },
];

export default function TrustStrip() {
  return (
    <section className="bg-zinc-950 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/5 transition"
              >
                <div className="w-12 h-12 flex-shrink-0 rounded-full bg-red-600/15 flex items-center justify-center">
                  <Icon className="text-red-500" size={22} />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold uppercase tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-zinc-400 text-sm mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
