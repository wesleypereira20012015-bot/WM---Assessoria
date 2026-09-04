"use client";

import { useRef, useState } from "react";
import type { Asset } from "@/lib/criador";

/**
 * Prévia do carrossel do jeito que sai no Instagram: desliza na horizontal,
 * uma prancha por vez, com os pontinhos embaixo.
 *
 * Usa scroll nativo com scroll-snap em vez de uma biblioteca de slider,
 * porque o gesto de arrastar no celular já vem de graça e o projeto não
 * tem nenhuma lib de carrossel.
 */
export default function Carrossel({ assets }: { assets: Asset[] }) {
  const trilho = useRef<HTMLDivElement>(null);
  const [atual, setAtual] = useState(0);

  if (assets.length === 0) {
    return (
      <div
        style={{
          aspectRatio: "4 / 5",
          display: "grid",
          placeItems: "center",
          border: "1px dashed var(--linha-forte)",
          borderRadius: 12,
          color: "var(--suave)",
          fontSize: 14,
          textAlign: "center",
          padding: 20,
        }}
      >
        Ainda sem arte renderizada.
      </div>
    );
  }

  function aoRolar() {
    const el = trilho.current;
    if (!el) return;
    setAtual(Math.round(el.scrollLeft / el.clientWidth));
  }

  function irPara(i: number) {
    const el = trilho.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  }

  return (
    <div>
      <div
        ref={trilho}
        onScroll={aoRolar}
        style={{
          display: "flex",
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          borderRadius: 12,
          background: "var(--marinho-950)",
          scrollbarWidth: "none",
        }}
      >
        {assets.map((asset) => (
          <img
            key={asset.id}
            src={asset.url_publica}
            alt={`Prancha ${asset.ordem}`}
            width={1080}
            height={1350}
            loading="lazy"
            style={{
              width: "100%",
              flex: "0 0 100%",
              scrollSnapAlign: "start",
              display: "block",
              height: "auto",
            }}
          />
        ))}
      </div>

      {assets.length > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 7, marginTop: 12 }}>
          {assets.map((asset, i) => (
            <button
              key={asset.id}
              type="button"
              onClick={() => irPara(i)}
              aria-label={`Ir para a prancha ${i + 1}`}
              aria-current={i === atual}
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                border: "none",
                padding: 0,
                cursor: "pointer",
                background: i === atual ? "var(--ouro-500)" : "var(--linha)",
              }}
            />
          ))}
        </div>
      )}

      <p style={{ fontSize: 11.5, color: "var(--suave)", marginTop: 12, lineHeight: 1.6 }}>
        {assets.map((a) => (
          <span key={a.id} style={{ display: "block" }}>
            {a.ordem}. foto de {a.credito_fotografo} ({a.fonte_foto})
            {a.url_original_foto && (
              <>
                {" · "}
                <a href={a.url_original_foto} target="_blank" rel="noopener noreferrer">
                  original
                </a>
              </>
            )}
          </span>
        ))}
      </p>
    </div>
  );
}
