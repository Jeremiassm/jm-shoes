import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle, ArrowRight, Package, Search, Plane, Home } from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import SEO from "../components/SEO";
import TrustStrip from "../components/home/TrustStrip";
import { getWhatsAppLink } from "../config/contact";

const steps = [
  {
    icon: Search,
    title: "Curamos",
    text: "Buscamos los mejores modelos en tiendas oficiales.",
  },
  {
    icon: Package,
    title: "Te asesoramos",
    text: "Si tenés dudas, te ayudamos a encontrar la mejor zapatilla que se adapte a vos y realizamos el pedido.",
  },
  {
    icon: Plane,
    title: "Traemos",
    text: "Importamos tu par directamente desde Estados Unidos, 100% original.",
  },
  {
    icon: Home,
    title: "Entregamos",
    text: "Coordinamos el envío a cualquier punto de Argentina o retiro en persona.",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
};

export default function About() {
  const whatsappLink = getWhatsAppLink("Hola! Quiero saber más sobre JM Shoes.");

  return (
    <div className="bg-black min-h-screen text-white">
      <SEO
        title="Nosotros - JM Shoes | Quienes somos"
        description="JM Shoes: tienda especializada en zapatillas de basketball importadas de Estados Unidos. Curaduria, pedidos por WhatsApp y envios a toda Argentina."
        keywords="jm shoes, quienes somos, zapatillas importadas, basketball argentina, sneakers usa"
      />
      <Navbar />

      <main id="main" role="main">
        <section className="pt-32 pb-16 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.p
              {...fadeUp}
              className="text-red-500 uppercase tracking-widest text-sm font-semibold mb-3"
            >
              Quienes somos
            </motion.p>
            <motion.h1
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.1 }}
              className="font-display text-6xl md:text-8xl font-bold uppercase tracking-tight leading-[0.9]"
            >
              Nosotros
            </motion.h1>
            <motion.p
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.2 }}
              className="text-zinc-400 mt-8 max-w-2xl text-lg leading-relaxed"
            >
              Somos una tienda de Argentina dedicada a una sola cosa: conseguir
              las zapatillas de basketball que aca no se consiguen. Las traemos
              directamente de Estados Unidos, bajo pedido, para que juegues con
              el mismo par que usan los mejores.
            </motion.p>
          </div>
        </section>

        <section className="px-6 py-16 border-t border-white/5">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-start">
            <motion.div {...fadeUp}>
              <h2 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight leading-tight">
                No es solo una zapatilla. Es tu juego.
              </h2>
            </motion.div>
            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} className="space-y-5 text-zinc-300 leading-relaxed">
              <p>
                Nacimos como muchos: queriendo un par que en el país era
                imposible de encontrar. Lo que empezó como un pedido entre
                amigos se convirtió en JM Shoes, una tienda que trae los mejores
                pares al país de forma segura.
              </p>
              <p>
                No somos un local gigante ni un marketplace anónimo. Somos
                personas que juegan, miran partidos y conocen cada modelo que
                vendemos. Por eso, cuando nos escribís, tratamos de guiarte
                para conseguir el mejor modelo para tu estilo de juego,
                posición o cualquiera que sea tu necesidad.
              </p>
              <p>
                Cada par es original, traido de Estados Unidos y verificado
                antes de la entrega.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="px-6 py-16 border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <motion.h2
              {...fadeUp}
              className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight mb-12"
            >
              Como trabajamos
            </motion.h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.title}
                    {...fadeUp}
                    transition={{ ...fadeUp.transition, delay: i * 0.08 }}
                    className="bg-zinc-900 border border-white/5 rounded-2xl p-6 hover:border-red-500/40 transition"
                  >
                    <div className="w-12 h-12 rounded-full bg-red-600/15 flex items-center justify-center mb-4">
                      <Icon className="text-red-500" size={22} aria-hidden="true" />
                    </div>
                    <p className="text-zinc-500 text-xs uppercase tracking-widest font-semibold mb-1">
                      Paso {i + 1}
                    </p>
                    <h3 className="font-display text-xl font-bold uppercase tracking-tight">
                      {step.title}
                    </h3>
                    <p className="text-zinc-400 text-sm mt-2 leading-relaxed">
                      {step.text}
                    </p>
                  </motion.div>
                );
              })}
            </div>
            <motion.div {...fadeUp} className="mt-10">
              <Link
                to="/como-comprar"
                className="inline-flex items-center gap-2 text-red-500 hover:text-red-400 transition text-sm uppercase tracking-widest font-semibold"
              >
                Ver el proceso completo
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </motion.div>
          </div>
        </section>

        <section className="px-6 py-16 border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <motion.div
              {...fadeUp}
              className="bg-zinc-900 border border-white/5 rounded-2xl p-8 md:p-10"
            >
              <p className="text-red-500 uppercase tracking-widest text-xs font-semibold mb-3">
                Sobre las reviews
              </p>
              <p className="text-zinc-300 leading-relaxed">
                Si bien es imposible probar todos los pares de zapatillas (más en
                Argentina) y cada persona tiene un pie o lesiones diferentes, la
                idea de la página es tratar de reunir la mayor información
                posible de la web (doctores deportivos, reviewers de zapatillas,
                jugadores profesionales) o reviews propias de zapatillas con las
                que jugamos en JM Shoes. Todo para que consigas el mejor par para
                vos y puedas rendir al máximo en cancha.
              </p>
            </motion.div>
          </div>
        </section>

        <TrustStrip />

        <section className="px-6 py-20">
          <div className="max-w-7xl mx-auto text-center">
            <motion.h2
              {...fadeUp}
              className="font-display text-4xl md:text-6xl font-bold uppercase tracking-tight"
            >
              Hablemos
            </motion.h2>
            <motion.p
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.1 }}
              className="text-zinc-400 mt-6 max-w-xl mx-auto leading-relaxed"
            >
              Tenés un modelo en mente? Escribinos y te contamos si lo podemos
              conseguir, cuánto sale y cuánto tarda.
            </motion.p>
            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.2 }}
              className="mt-10 flex flex-wrap gap-4 justify-center"
            >
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 transition px-8 py-4 rounded-full font-bold uppercase tracking-wider text-sm"
              >
                <MessageCircle size={20} aria-hidden="true" />
                Escribinos por WhatsApp
              </a>
              <Link
                to="/zapatillas"
                className="inline-flex items-center gap-3 border border-white/20 hover:border-white/60 hover:bg-white/5 transition px-8 py-4 rounded-full font-bold uppercase tracking-wider text-sm"
              >
                Ver catalogo
                <ArrowRight size={20} aria-hidden="true" />
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
