"use client";

import { MotionConfig } from "framer-motion";

/**
 * Configuração global de animação: respeita a preferência
 * "reduzir movimento" do usuário (troca deslocamentos por fade simples).
 */
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
