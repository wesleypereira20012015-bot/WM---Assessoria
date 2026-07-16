import { site } from "@/content/site";
import { comDestaque } from "@/lib/texto";
import Card from "@/components/ui/Card";
import Reveal from "@/components/ui/Reveal";

/** Serviços — 6 cards em bloco marinho, contraste institucional. */
export default function Services() {
  return (
    <section className="section sec-escuro" id="servicos">
      <div className="container">
        <Reveal className="section-head">
          <span className="eyebrow">{site.servicos.eyebrow}</span>
          <h2 className="display">{comDestaque(site.servicos.titulo)}</h2>
        </Reveal>
        <div className="grid-3">
          {site.servicos.lista.map((s, i) => (
            <Card key={s.titulo} icone={s.icone} titulo={s.titulo} indice={i}>
              {s.texto}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
