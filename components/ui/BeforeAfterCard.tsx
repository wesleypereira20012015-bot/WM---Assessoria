import Reveal from "./Reveal";
import Chip from "./Chip";

/** Card de ancoragem: valor "antes" riscado × valor "depois" em verde. */
export default function BeforeAfterCard({
  descricao,
  antes,
  depois,
  legenda,
}: {
  descricao: string;
  antes: string;
  depois: string;
  legenda: string;
}) {
  return (
    <Reveal delay={0.15}>
      <article
        className="card"
        style={{ display: "flex", flexDirection: "column", gap: 12, height: "100%" }}
      >
        <h3 style={{ margin: 0 }}>{descricao}</h3>
        <div style={{ display: "flex", alignItems: "baseline", gap: 22, flexWrap: "wrap" }}>
          <div>
            <span className="mono" style={{ fontSize: 10, color: "var(--suave)", display: "block" }}>
              Antes
            </span>
            <span
              style={{
                fontFamily: "var(--font-cormorant), serif",
                fontSize: 30,
                color: "var(--suave)",
                textDecoration: "line-through",
              }}
            >
              {antes}
            </span>
          </div>
          <svg width="26" height="14" viewBox="0 0 26 14" fill="none" aria-hidden="true">
            <path d="M1 7h22m0 0-5-5m5 5-5 5" stroke="var(--acento)" strokeWidth="1.4" />
          </svg>
          <div>
            <span className="mono" style={{ fontSize: 10, color: "var(--suave)", display: "block" }}>
              Depois
            </span>
            <span
              style={{
                fontFamily: "var(--font-cormorant), serif",
                fontSize: 42,
                fontWeight: 600,
                color: "var(--ok)",
              }}
            >
              {depois}
            </span>
          </div>
        </div>
        <p style={{ fontSize: 13.5 }}>{legenda}</p>
        <div>
          <Chip ok>CND emitida ✓</Chip>
        </div>
      </article>
    </Reveal>
  );
}
