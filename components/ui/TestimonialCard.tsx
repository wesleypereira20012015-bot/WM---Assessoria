import Reveal from "./Reveal";

/** Depoimento: inicial do cliente + tipo de obra + valor em destaque. */
export default function TestimonialCard({
  nome,
  tipoObra,
  destaque,
  valor,
  children,
  indice = 0,
}: {
  nome: string;
  tipoObra: string;
  destaque: string;
  valor: string;
  children: React.ReactNode;
  indice?: number;
}) {
  return (
    <Reveal delay={indice * 0.1}>
      <article className="card" style={{ height: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span
            aria-hidden="true"
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              border: "1px solid var(--linha-forte)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-cormorant), serif",
              fontSize: 24,
              fontWeight: 600,
              color: "var(--acento)",
              flex: "none",
            }}
          >
            {nome.charAt(0)}
          </span>
          <div>
            <strong style={{ color: "var(--titulo)", display: "block", fontSize: 15.5 }}>{nome}</strong>
            <span className="mono" style={{ fontSize: 10.5, color: "var(--suave)" }}>
              {tipoObra}
            </span>
          </div>
        </div>
        <p
          style={{
            margin: "20px 0 2px",
            fontFamily: "var(--font-cormorant), serif",
            fontSize: 30,
            fontWeight: 600,
            color: "var(--acento)",
            lineHeight: 1.12,
          }}
        >
          {destaque}
        </p>
        <p style={{ fontSize: 13, color: "var(--ok)", fontWeight: 600 }}>{valor}</p>
        <p style={{ marginTop: 12, fontSize: 14.5 }}>{children}</p>
      </article>
    </Reveal>
  );
}
