import { existsSync } from "fs";
import path from "path";
import { site } from "@/content/site";
import { comDestaque } from "@/lib/texto";
import { linkWhatsApp } from "@/lib/whatsapp";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import Reveal from "@/components/ui/Reveal";

/**
 * Procura uma foto para o topo em public/images/
 * (hero.jpg, hero.jpeg, hero.png ou hero.webp).
 * Se não existir, o site usa a ilustração de canteiro de obras.
 */
function fotoDoHero(): string | null {
  for (const ext of ["jpg", "jpeg", "png", "webp"]) {
    if (existsSync(path.join(process.cwd(), "public", "images", `hero.${ext}`))) {
      return `/images/hero.${ext}`;
    }
  }
  return null;
}

/** Silhueta discreta de canteiro de obras ao entardecer. */
function Skyline() {
  return (
    <svg
      className="hero-skyline"
      viewBox="0 0 1440 260"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sky-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0F1F36" stopOpacity="0" />
          <stop offset="1" stopColor="#0F1F36" />
        </linearGradient>
        <linearGradient id="grad-hz" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#C9A24A" stopOpacity="0" />
          <stop offset="0.5" stopColor="#C9A24A" stopOpacity="0.6" />
          <stop offset="1" stopColor="#C9A24A" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="0" y="256" width="1440" height="1.5" fill="url(#grad-hz)" />
      <g fill="#0F1F36">
        <rect x="40" y="150" width="90" height="110" />
        <rect x="150" y="110" width="70" height="150" />
        <rect x="250" y="170" width="110" height="90" />
        <rect x="1050" y="130" width="80" height="130" />
        <rect x="1160" y="90" width="100" height="170" />
        <rect x="1290" y="160" width="110" height="100" />
      </g>
      <g stroke="#16304F" strokeWidth="3" fill="none">
        <path d="M420 260V120h150v140M420 155h150M420 190h150M420 225h150M457 120v140M532 120v140" />
      </g>
      <g stroke="#C9A24A" strokeWidth="1.6" opacity="0.6">
        <path d="M435 120v-16M465 120v-22M495 120v-14M525 120v-20M555 120v-15" />
      </g>
      <g stroke="#C9A24A" strokeWidth="2.4" fill="none" strokeLinecap="round" opacity="0.85">
        <path d="M760 260V70M760 70h210M760 70l-60 40M760 90l180-20M940 70v18M905 70v40" />
        <path d="M760 110l-26 26M734 136l26 26M760 162l-26 26M734 188l26 26M760 214l-26 26" strokeWidth="1.6" opacity="0.7" />
      </g>
      <g fill="#C9A24A" opacity="0.4">
        <rect x="1180" y="110" width="8" height="10" />
        <rect x="1200" y="140" width="8" height="10" />
        <rect x="1225" y="120" width="8" height="10" />
        <rect x="168" y="130" width="7" height="9" />
        <rect x="188" y="160" width="7" height="9" />
      </g>
      <rect x="0" y="200" width="1440" height="60" fill="url(#sky-fade)" />
    </svg>
  );
}

/** Dobra principal: dor no título + prova + um único CTA ouro. */
export default function Hero() {
  const foto = fotoDoHero();
  return (
    <section className="hero sec-escuro" id="topo">
      {foto ? (
        <div className="hero-foto" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={foto} alt="" />
        </div>
      ) : (
        <Skyline />
      )}
      <div className="container hero-conteudo">
        <Reveal>
          <span className="eyebrow">{site.hero.eyebrow}</span>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="display" style={{ marginTop: 26 }}>
            {comDestaque(site.hero.titulo)}
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p style={{ marginTop: 24, fontSize: 18.5, maxWidth: 540, color: "var(--nevoa-300)" }}>
            {site.hero.subtitulo}
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <div className="hero-ctas">
            <Button variante="ouro" href="#calculadora">
              {site.hero.botaoPrincipal}
            </Button>
            <Button variante="ghost" href={linkWhatsApp()}>
              {site.hero.botaoWhatsApp}
            </Button>
          </div>
        </Reveal>
        <Reveal delay={0.4}>
          <div className="hero-chips">
            <Chip>CNO</Chip>
            <Chip>SERO · DCTFWeb</Chip>
            <Chip ok>CND emitida ✓</Chip>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
