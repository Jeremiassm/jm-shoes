import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import heroBg from "../../assets/hero.png";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="h-screen relative overflow-hidden flex items-center">
      <img
        src={heroBg}
        alt="Zapatilla de basketball sobre cancha"
        className="absolute inset-0 w-full h-full object-cover opacity-30"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-red-500 uppercase tracking-widest text-sm font-semibold mb-4"
        >
          Nueva temporada
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="font-display text-6xl md:text-8xl font-bold uppercase leading-[0.9] tracking-tight"
        >
          Elevá tu <br />
          juego
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-zinc-300 max-w-xl text-lg"
        >
          Zapatillas exclusivas traídas directamente de Estados Unidos.
          Las mejores marcas para jugadores que buscan rendimiento y estilo.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 flex flex-wrap gap-4"
        >
          <button
            onClick={() => navigate("/zapatillas")}
            className="bg-red-600 hover:bg-red-700 transition px-8 py-4 rounded-full font-semibold uppercase tracking-wider text-sm"
          >
            Ver catálogo
          </button>
          <button
            onClick={() => navigate("/como-comprar")}
            className="border border-white/20 hover:border-white/60 hover:bg-white/5 transition px-8 py-4 rounded-full font-semibold uppercase tracking-wider text-sm"
          >
            Cómo comprar
          </button>
        </motion.div>
      </div>
    </section>
  );
}
