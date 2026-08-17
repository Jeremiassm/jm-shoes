import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  MessageCircle,
  CreditCard,
  Package,
  Truck,
  ChevronDown,
  HelpCircle,
  Mail,
  ArrowRight,
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import SEO from "../components/SEO";
import { getWhatsAppLink, WHATSAPP_NUMBER, EMAIL } from "../config/contact";

const steps = [
  {
    icon: Search,
    title: "Explorá el catálogo",
    description:
      "Recorré nuestro catálogo de zapatillas. Filtrá por marca, talle, precio o puntuación de review para encontrar el modelo ideal para tu juego.",
  },
  {
    icon: MessageCircle,
    title: "Escribinos por WhatsApp",
    description:
      "Hacé click en 'Pedir por WhatsApp' desde cualquier producto o contactanos directamente. Te respondemos a la brevedad con disponibilidad, talles y cualquier duda que tengas.",
  },
  {
    icon: CreditCard,
    title: "Confirmá talle y pago",
    description:
      "Coordinamos el método de pago que prefieras: transferencia bancaria, efectivo o MercadoPago. Confirmamos dirección de envío y el pedido queda reservado.",
  },
  {
    icon: Package,
    title: "Preparamos tu paquete directamente de USA",
    description:
      "Una vez confirmado el pago, solicitamos tu pedido y esperamos que llegue al pais en 20 días hábiles.",
  },
  {
    icon: Truck,
    title: "Recibí en tu casa",
    description:
      "Una vez llegado al pais, te enviamos el pedido a cualquier punto del país con número de seguimiento.",
  },
];

const paymentMethods = [
  { name: "Transferencia bancaria", detail: "Coordinamos los datos por WhatsApp" },
  { name: "Efectivo", detail: "Coordiná el pago (Solo disponible en Resistencia)" },
  { name: "MercadoPago", detail: "Tarjeta de crédito, débito o dinero en cuenta de mercado pago (no manejamos los intereses de la aplicación)" },
  { name: "Cryptos (USDT)", detail: "5% de descuento pagando en crypto (USDT)" },
];

const faqs = [
  {
    q: "¿Los productos son originales?",
    a: "Sí, todos nuestros productos son 100% originales y provienen directamente de tiendas oficiales de Estados Unidos. Trabajamos únicamente con retailers autorizados.",
  },
  {
    q: "¿Hacen envíos a todo el país?",
    a: "Sí, hacemos envíos a cualquier punto de Argentina a través de Andreani. Los tiempos y costos dependen de la zona.",
  },
  {
    q: "¿Cuánto demora el envío?",
    a: "En Resistencia la entrega es inmediata ni bien llega al depósito. Al resto del país, 7 días hábiles.",
  },
  {
    q: "¿Puedo cambiar o devolver un producto?",
    a: "Sí, aceptamos cambios dentro de los 7 días posteriores a la recepción. El producto debe estar sin uso y en su empaque original. Los costos de envío corren por cuenta del comprador.",
  },
  {
    q: "¿Tienen stock de todos los modelos?",
    a: "El stock es limitado porque trabajamos con modelos exclusivos. Te recomendamos consultar disponibilidad por WhatsApp antes de hacer la transferencia.",
  },
  {
    q: "¿Puedo reservar un producto?",
    a: "Sí, una vez que confirmamos disponibilidad y coordinás el pago, el producto queda reservado a tu nombre hasta 24 horas hábiles.",
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/5 rounded-2xl bg-zinc-900 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-zinc-800/50 transition"
        aria-expanded={open}
      >
        <span className="font-display text-base md:text-lg font-bold uppercase tracking-tight">
          {q}
        </span>
        <ChevronDown
          className={`text-zinc-400 flex-shrink-0 transition-transform ${open ? "rotate-180 text-red-500" : ""}`}
          size={20}
        />
      </button>
      {open && (
        <div className="px-5 pb-5 text-zinc-300 leading-relaxed text-sm">
          {a}
        </div>
      )}
    </div>
  );
}

export default function HowToBuy() {
  return (
    <div className="bg-black min-h-screen text-white">
      <SEO
        title="Cómo comprar - JM Shoes | Guía paso a paso"
        description="Aprendé cómo comprar en JM Shoes en 5 pasos simples. Envíos a todo el país, pago seguro y productos 100% originales."
        keywords="cómo comprar zapatillas, jm shoes, envio zapatillas, métodos de pago"
      />
      <Navbar />

      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-red-500 uppercase tracking-widest text-sm font-semibold mb-4">
            Guía paso a paso
          </p>
          <h1 className="font-display text-5xl md:text-7xl font-bold uppercase tracking-tight leading-[0.95]">
            Cómo comprar
          </h1>
          <p className="text-zinc-400 text-lg mt-6 max-w-2xl mx-auto">
            Comprar en JM Shoes es simple, seguro y 100% personalizado. Te acompañamos en cada paso hasta que recibas tu pedido.
          </p>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="space-y-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isReverse = index % 2 === 1;
              return (
                <div
                  key={step.number}
                  className={`bg-zinc-900 rounded-3xl p-6 md:p-10 border border-white/5 hover:border-red-500/20 transition flex flex-col md:flex-row gap-6 md:gap-10 items-center ${
                    isReverse ? "md:flex-row-reverse" : ""
                  }`}
                >
                  <div className="flex-shrink-0 relative">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-red-600/10 flex items-center justify-center">
                      <Icon className="text-red-500" size={48} />
                    </div>
                    <span className="absolute -top-3 -right-3 font-display text-3xl md:text-4xl font-bold text-red-600">
                      {step.number}
                    </span>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight">
                      {step.title}
                    </h2>
                    <p className="text-zinc-300 mt-3 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-zinc-950 border-y border-white/5 px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-red-500 uppercase tracking-widest text-sm font-semibold mb-3">
              Tu compra, tu forma
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight">
              Métodos de pago
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paymentMethods.map((method) => (
              <div
                key={method.name}
                className="bg-zinc-900 rounded-2xl p-6 border border-white/5 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-green-600/15 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="text-green-500" size={22} />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold uppercase tracking-tight">
                    {method.name}
                  </h3>
                  <p className="text-zinc-400 text-sm mt-1">{method.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-red-500 uppercase tracking-widest text-sm font-semibold mb-3">
              Llegamos a todo el país
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight">
              Envíos
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-zinc-900 rounded-2xl p-6 border border-white/5">
              <h3 className="font-display text-2xl font-bold uppercase tracking-tight">CABA</h3>
              <p className="text-zinc-300 mt-3 text-sm leading-relaxed">
                Envío a domicilio o retiro en punto de encuentro. 3 a 5 días hábiles.
              </p>
              <p className="text-red-500 font-semibold mt-4 text-sm">Costo bonificado en compras +$200.000</p>
            </div>
            <div className="bg-zinc-900 rounded-2xl p-6 border border-white/5">
              <h3 className="font-display text-2xl font-bold uppercase tracking-tight">GBA</h3>
              <p className="text-zinc-300 mt-3 text-sm leading-relaxed">
                Envío por moto o correo dependiendo de la zona. 4 a 6 días hábiles.
              </p>
              <p className="text-red-500 font-semibold mt-4 text-sm">Consultá costo por WhatsApp</p>
            </div>
            <div className="bg-zinc-900 rounded-2xl p-6 border border-white/5">
              <h3 className="font-display text-2xl font-bold uppercase tracking-tight">Interior</h3>
              <p className="text-zinc-300 mt-3 text-sm leading-relaxed">
                Correo Argentino o encomienda. 5 a 10 días hábiles según localidad.
              </p>
              <p className="text-red-500 font-semibold mt-4 text-sm">Envío gratis en compras +$300.000</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-zinc-950 border-y border-white/5 px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <HelpCircle className="text-red-500 mx-auto mb-4" size={36} />
            <h2 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight">
              Preguntas frecuentes
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-red-600 to-red-800 rounded-3xl p-8 md:p-12 text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight">
            ¿Listo para subir tu nivel?
          </h2>
          <p className="text-white/80 mt-4 max-w-xl mx-auto">
            Contactanos ahora y empezá a disfrutar de las zapatillas que siempre quisiste.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mt-8">
            <a
              href={getWhatsAppLink("Hola! Quiero hacer una consulta.")}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-red-600 hover:bg-zinc-100 transition px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm flex items-center gap-2"
            >
              <MessageCircle size={18} />
              WhatsApp: {WHATSAPP_NUMBER}
            </a>
            <Link
              to="/zapatillas"
              className="bg-black/20 hover:bg-black/40 transition px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm flex items-center gap-2 border border-white/20"
            >
              Ver catálogo
              <ArrowRight size={18} />
            </Link>
          </div>
          <p className="text-white/70 text-sm mt-6 flex items-center justify-center gap-2">
            <Mail size={14} />
            {EMAIL}
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
