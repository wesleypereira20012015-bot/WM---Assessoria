import { site } from "@/content/site";
import { comDestaque } from "@/lib/texto";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";

/** O risco de não regularizar — urgência real, tom sério e sóbrio. */
export default function Risks() {
  const r = site.riscos;
  return (
    <section className="section sec-claro" id="riscos">
      <div className="container">
        <Reveal className="section-head">
          <span className="eyebrow" style={{ color: "var(--atencao)" }}>
            {r.eyebrow}
          </span>
          <h2 className="display">{comDestaque(r.titulo)}</h2>
        </Reveal>
        <div className="grid-2" style={{ gap: 20 }}>
          {r.itens.map((item, i) => (
            <Reveal key={item.titulo} delay={i * 0.08}>
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  padding: "24px 26px",
                  background: "var(--card-bg)",
                  border: "1px solid var(--card-borda)",
                  borderLeft: "2px solid var(--atencao)",
                  borderRadius: "var(--r-card)",
                  boxShadow: "var(--sombra-card)",
                  height: "100%",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ flex: "none", marginTop: 3 }} aria-hidden="true">
                  <path d="M12 3 2.5 20h19L12 3Z" stroke="var(--atencao)" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M12 10v4.5M12 17.5v.5" stroke="var(--atencao)" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
                <div>
                  <h3
                    style={{
                      fontFamily: "var(--font-cormorant), serif",
                      fontSize: 21,
                      fontWeight: 600,
                      color: "var(--titulo)",
                      marginBottom: 6,
                    }}
                  >
                    {item.titulo}
                  </h3>
                  <p style={{ fontSize: 14.5 }}>{item.texto}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2}>
          <div
            className="sec-escuro"
            style={{
              marginTop: 44,
              display: "flex",
              gap: 24,
              alignItems: "center",
              flexWrap: "wrap",
              justifyContent: "space-between",
              padding: "30px 34px",
              borderRadius: "var(--r-bloco)",
              background: "var(--marinho-900)",
              border: "1px solid rgba(201,162,74,.3)",
            }}
          >
            <p style={{ fontSize: 16.5, color: "#F3EFE8", maxWidth: 560 }}>{r.alivio}</p>
            <Button variante="ouro" href="#calculadora">
              {r.botao}
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
