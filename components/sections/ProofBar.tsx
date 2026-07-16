import { site } from "@/content/site";
import Counter from "@/components/ui/Counter";
import Reveal from "@/components/ui/Reveal";

/** Barra de prova social: contadores em fundo claro, tom institucional. */
export default function ProofBar() {
  return (
    <section
      aria-label="Nossos números"
      className="sec-claro"
      style={{
        background: "var(--bg)",
        borderBottom: "1px solid var(--linha)",
        padding: "64px 0",
      }}
    >
      <div className="container">
        <div className="grid-3" style={{ textAlign: "center", gap: 32 }}>
          {site.prova.numeros.map((n, i) => (
            <Reveal key={i} delay={i * 0.12}>
              <p
                style={{
                  fontFamily: "var(--font-cormorant), serif",
                  fontSize: "clamp(38px, 4.8vw, 56px)",
                  fontWeight: 600,
                  color: "var(--titulo)",
                  lineHeight: 1.05,
                }}
              >
                <Counter valor={n.valor} prefixo={n.prefixo} sufixo={n.sufixo} />
              </p>
              <div
                aria-hidden="true"
                style={{ width: 34, height: 1, background: "var(--acento)", margin: "14px auto 10px" }}
              />
              <p style={{ fontSize: 14, color: "var(--texto)" }}>{n.rotulo}</p>
            </Reveal>
          ))}
        </div>
        <p style={{ textAlign: "center", fontSize: 13, color: "var(--suave)", marginTop: 32, fontStyle: "italic" }}>
          {site.prova.nota}
        </p>
      </div>
    </section>
  );
}
