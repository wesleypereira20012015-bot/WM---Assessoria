import { site } from "@/content/site";
import { comDestaque } from "@/lib/texto";
import Reveal from "@/components/ui/Reveal";
import StepCard from "@/components/ui/StepCard";

/** Como funciona — 3 etapas com códigos fiscais, em fundo claro. */
export default function HowItWorks() {
  return (
    <section className="section sec-claro" id="como-funciona">
      <div className="container">
        <Reveal className="section-head">
          <span className="eyebrow">{site.comoFunciona.eyebrow}</span>
          <h2 className="display">{comDestaque(site.comoFunciona.titulo)}</h2>
        </Reveal>
        <div className="grid-3">
          {site.comoFunciona.etapas.map((etapa, i) => (
            <StepCard key={etapa.numero} numero={etapa.numero} codigo={etapa.codigo} titulo={etapa.titulo} indice={i}>
              {etapa.texto}
            </StepCard>
          ))}
        </div>
      </div>
    </section>
  );
}
