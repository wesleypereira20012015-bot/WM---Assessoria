import { readdirSync } from "fs";
import path from "path";
import { site } from "@/content/site";
import { comDestaque } from "@/lib/texto";
import BeforeAfterCard from "@/components/ui/BeforeAfterCard";
import Reveal from "@/components/ui/Reveal";
import TestimonialCard from "@/components/ui/TestimonialCard";

/**
 * Fotos de obras (opcional): qualquer imagem salva em
 * public/images/obras/ aparece aqui automaticamente.
 * O nome do arquivo vira a legenda: "casa-em-araras.jpg" → "Casa em araras".
 */
function fotosDeObras(): { src: string; legenda: string }[] {
  try {
    const pasta = path.join(process.cwd(), "public", "images", "obras");
    return readdirSync(pasta)
      .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
      .sort()
      .map((f) => {
        const nome = f.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
        return {
          src: `/images/obras/${f}`,
          legenda: nome.charAt(0).toUpperCase() + nome.slice(1),
        };
      });
  } catch {
    return [];
  }
}

/** Resultados reais: depoimentos + caso antes/depois + fotos + disclaimer. */
export default function Results() {
  const r = site.resultados;
  const fotos = fotosDeObras();
  return (
    <section className="section sec-escuro" id="resultados">
      <div className="container">
        <Reveal className="section-head">
          <span className="eyebrow">{r.eyebrow}</span>
          <h2 className="display">{comDestaque(r.titulo)}</h2>
        </Reveal>
        <div className="grid-3">
          {r.depoimentos.map((d, i) => (
            <TestimonialCard
              key={d.nome}
              nome={d.nome}
              tipoObra={d.tipoObra}
              destaque={d.destaque}
              valor={d.valor}
              indice={i}
            >
              {d.texto}
            </TestimonialCard>
          ))}
        </div>
        <div style={{ marginTop: 24, maxWidth: 560 }}>
          <BeforeAfterCard
            descricao={r.antesDepois.descricao}
            antes={r.antesDepois.antes}
            depois={r.antesDepois.depois}
            legenda={r.antesDepois.legenda}
          />
        </div>

        {fotos.length > 0 && (
          <Reveal delay={0.1}>
            <div className="galeria">
              {fotos.map((f) => (
                <figure key={f.src}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.src} alt={f.legenda} loading="lazy" />
                  <figcaption>{f.legenda}</figcaption>
                </figure>
              ))}
            </div>
          </Reveal>
        )}

        <Reveal delay={0.2}>
          <p style={{ marginTop: 36, fontSize: 13, color: "var(--suave)", fontStyle: "italic" }}>
            {r.disclaimer}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
