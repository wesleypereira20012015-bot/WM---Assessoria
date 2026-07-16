"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

/** Número que sobe de 0 até o valor quando entra na tela. */
export default function Counter({
  valor,
  prefixo = "",
  sufixo = "",
  duracao = 1.8,
}: {
  valor: number;
  prefixo?: string;
  sufixo?: string;
  duracao?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const emTela = useInView(ref, { once: true, margin: "-40px" });
  const reduzir = useReducedMotion();
  const [atual, setAtual] = useState(0);

  useEffect(() => {
    if (!emTela) return;
    if (reduzir) {
      setAtual(valor);
      return;
    }
    let quadro: number;
    const inicio = performance.now();
    const passo = (agora: number) => {
      const t = Math.min((agora - inicio) / (duracao * 1000), 1);
      // easing "easeOutExpo" — desacelera perto do final
      const e = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setAtual(Math.round(valor * e));
      if (t < 1) quadro = requestAnimationFrame(passo);
    };
    quadro = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(quadro);
  }, [emTela, valor, duracao, reduzir]);

  return (
    <span ref={ref}>
      {prefixo}
      {atual.toLocaleString("pt-BR")}
      {sufixo}
    </span>
  );
}
