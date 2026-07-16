import { site } from "@/content/site";
import { comDestaque } from "@/lib/texto";
import FAQAccordion from "@/components/ui/FAQAccordion";
import Reveal from "@/components/ui/Reveal";

/** FAQ estratégico — educa e conduz ao contato. */
export default function FAQ() {
  return (
    <section className="section sec-claro" id="faq">
      <div className="container" style={{ maxWidth: 860 }}>
        <Reveal className="section-head">
          <span className="eyebrow">{site.faq.eyebrow}</span>
          <h2 className="display">{comDestaque(site.faq.titulo)}</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <FAQAccordion itens={site.faq.perguntas} />
        </Reveal>
      </div>
    </section>
  );
}
