"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface Item {
  pergunta: string;
  resposta: string;
}

/** Accordion do FAQ — um item aberto por vez, com animação suave. */
export default function FAQAccordion({ itens }: { itens: Item[] }) {
  const [aberto, setAberto] = useState<number | null>(0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {itens.map((item, i) => {
        const estaAberto = aberto === i;
        return (
          <div
            key={i}
            style={{
              background: "var(--card-bg)",
              border: `1px solid ${estaAberto ? "var(--linha-forte)" : "var(--card-borda)"}`,
              borderRadius: "var(--r-card)",
              overflow: "hidden",
              boxShadow: "var(--sombra-card)",
              transition: "border-color .25s",
            }}
          >
            <button
              onClick={() => setAberto(estaAberto ? null : i)}
              aria-expanded={estaAberto}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "18px 22px",
                background: "none",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                color: "var(--titulo)",
                fontWeight: 600,
                fontSize: 15.5,
                minHeight: 56,
              }}
            >
              <span style={{ flex: 1 }}>{item.pergunta}</span>
              <motion.svg
                width="14"
                height="9"
                viewBox="0 0 14 9"
                fill="none"
                animate={{ rotate: estaAberto ? 180 : 0 }}
                style={{ flex: "none" }}
                aria-hidden="true"
              >
                <path d="M1 1l6 6 6-6" stroke="var(--acento)" strokeWidth="1.8" />
              </motion.svg>
            </button>
            <AnimatePresence initial={false}>
              {estaAberto && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <p style={{ padding: "0 22px 20px", fontSize: 15 }}>{item.resposta}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
