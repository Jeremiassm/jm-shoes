import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import styles from "./styles.module.css";

const HERO_IMG = "/hero3.avif";

const HEADLINE_WORDS = ["JM", "SHOES"];

export default function SneakerHero() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Parallax y fade controlado por scroll
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.4], [0, -80]);

  return (
    <section ref={sectionRef} className={styles.section} aria-label="Hero principal">
      <motion.div className={styles.imageWrap} style={{ y: imageY, scale: imageScale }}>
        <img
          src={HERO_IMG}
          alt="Zapatilla de basketball sobre fondo oscuro"
          className={styles.image}
          fetchPriority="high"
          decoding="async"
        />
        <div className={styles.imageGradient} aria-hidden="true" />
      </motion.div>

      <motion.div className={styles.overlay} style={{ opacity: overlayOpacity }} aria-hidden="true" />

      <motion.div
        className={styles.content}
        style={{ opacity: contentOpacity, y: contentY }}
      >
        <motion.p
          className={styles.eyebrow}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        >
          Basketball · Editorial
        </motion.p>

        <h1 className={styles.headline}>
          {HEADLINE_WORDS.map((word, wi) => (
            <span key={word} className={styles.headlineLine}>
              {word.split("").map((char, ci) => (
                <motion.span
                  key={`${word}-${ci}`}
                  className={styles.headlineChar}
                  initial={{ y: "110%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    duration: 0.9,
                    ease: [0.22, 1, 0.36, 1],
                    delay: 0.2 + wi * 0.12 + ci * 0.04,
                  }}
                >
                  {char}
                </motion.span>
              ))}
            </span>
          ))}
        </h1>

        <motion.p
          className={styles.subhead}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.9 }}
        >
          Modelos exclusivos traídos directamente de Estados Unidos. Para jugadores que
          buscan rendimiento, estilo y un par que cuente una historia.
        </motion.p>

        <motion.div
          className={styles.cta}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 1.05 }}
        >
          <Link to="/zapatillas" className={styles.ctaPrimary}>
            Ver catalogo
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <Link to="/como-comprar" className={styles.ctaSecondary}>
            Como comprar
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        className={styles.scrollHint}
        style={{ opacity: overlayOpacity }}
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
      >
        <span className={styles.scrollHintLabel}>Scroll</span>
        <span className={styles.scrollHintLine} />
      </motion.div>
    </section>
  );
}
