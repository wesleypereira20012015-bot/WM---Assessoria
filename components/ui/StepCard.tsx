import Reveal from "./Reveal";

/** Card de etapa: número + código fiscal em mono + descrição. */
export default function StepCard({
  numero,
  codigo,
  titulo,
  children,
  indice = 0,
}: {
  numero: string;
  codigo: string;
  titulo: string;
  children: React.ReactNode;
  indice?: number;
}) {
  return (
    <Reveal delay={indice * 0.12}>
      <article className="card" style={{ height: "100%" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
          <span
            style={{
              fontFamily: "var(--font-cormorant), serif",
              fontStyle: "italic",
              fontSize: 44,
              fontWeight: 600,
              color: "var(--acento)",
              lineHeight: 1,
            }}
          >
            {numero}
          </span>
          <span className="chip" style={{ marginLeft: "auto" }}>
            {codigo}
          </span>
        </div>
        <h3>{titulo}</h3>
        <p>{children}</p>
      </article>
    </Reveal>
  );
}
