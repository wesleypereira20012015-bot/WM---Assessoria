"use client";

import { motion } from "framer-motion";
import { icones } from "@/components/Icons";

/** Card de benefício/serviço com ícone fino animado ao entrar na tela. */
export default function Card({
  icone,
  titulo,
  children,
  indice = 0,
}: {
  icone: string;
  titulo: string;
  children: React.ReactNode;
  indice?: number;
}) {
  return (
    <motion.article
      className="card"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: indice * 0.08 }}
    >
      <motion.div
        className="icone-fino"
        initial={{ scale: 0.6, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ type: "spring", stiffness: 220, damping: 18, delay: indice * 0.08 + 0.12 }}
      >
        {icones[icone]}
      </motion.div>
      <h3>{titulo}</h3>
      <p>{children}</p>
    </motion.article>
  );
}
