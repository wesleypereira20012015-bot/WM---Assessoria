import { site } from "@/content/site";
import { comDestaque } from "@/lib/texto";
import Calculator from "@/components/Calculator";
import Reveal from "@/components/ui/Reveal";

/** Seção da calculadora — fundo claro, tom de confiança. */
export default function CalculatorSection() {
  return (
    <section className="section sec-claro" id="calculadora">
      <div className="container">
        <Reveal className="section-head">
          <span className="eyebrow">{site.calculadora.eyebrow}</span>
          <h2 className="display">{comDestaque(site.calculadora.titulo)}</h2>
          <p>{site.calculadora.subtitulo}</p>
        </Reveal>
        <Reveal delay={0.15}>
          <Calculator />
        </Reveal>
      </div>
    </section>
  );
}
