import Image from "next/image";
import { existsSync } from "fs";
import path from "path";
import { site } from "@/content/site";
import { comDestaque } from "@/lib/texto";
import Chip from "@/components/ui/Chip";
import Reveal from "@/components/ui/Reveal";

/**
 * Encontra a foto na pasta public/images, aceitando qualquer extensão
 * comum (.jpg, .jpeg, .png, .webp). Assim, basta salvar o arquivo com o
 * nome certo — não importa o formato. Retorna null se não existir.
 */
function acharFoto(foto: string): string | null {
  const base = foto.replace(/\.[^./]+$/, ""); // tira a extensão do caminho configurado
  for (const ext of [".jpg", ".jpeg", ".png", ".webp"]) {
    if (existsSync(path.join(process.cwd(), "public", `${base}${ext}`))) {
      return `${base}${ext}`;
    }
  }
  return null;
}

/** Foto do especialista; se o arquivo ainda não existir, mostra a inicial. */
function Foto({ nome, foto }: { nome: string; foto: string }) {
  const src = acharFoto(foto);
  if (src) {
    return (
      <Image
        src={src}
        alt={`Foto de ${nome}`}
        width={132}
        height={132}
        style={{ borderRadius: "50%", objectFit: "cover", border: "2px solid var(--linha-forte)" }}
      />
    );
  }
  return (
    <div
      aria-hidden="true"
      style={{
        width: 132,
        height: 132,
        borderRadius: "50%",
        background: "var(--creme-200)",
        border: "1px solid var(--linha-forte)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-cormorant), serif",
        fontSize: 52,
        fontWeight: 600,
        color: "var(--acento)",
      }}
    >
      {nome.charAt(0)}
    </div>
  );
}

/** Quem somos — autoridade com rosto e nome, em creme mais quente. */
export default function About() {
  const q = site.quemSomos;
  return (
    <section className="section sec-claro-2" id="quem-somos" style={{ borderTop: "1px solid var(--linha)" }}>
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 48,
            alignItems: "center",
          }}
        >
          <Reveal>
            <span className="eyebrow">{q.eyebrow}</span>
            <h2 className="display" style={{ marginTop: 16 }}>
              {comDestaque(q.titulo)}
            </h2>
            <p style={{ marginTop: 18, fontSize: 16 }}>{q.texto}</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 26 }}>
              {q.chips.map((c) => (
                <Chip key={c}>{c}</Chip>
              ))}
            </div>
          </Reveal>
          <div style={{ display: "grid", gap: 24 }}>
            {q.pessoas.map((p, i) => (
              <Reveal key={p.nome} delay={i * 0.12}>
                <div
                  className="card"
                  style={{ display: "flex", alignItems: "center", gap: 24, padding: 24 }}
                >
                  <Foto nome={p.nome} foto={p.foto} />
                  <div>
                    <h3 style={{ margin: 0 }}>{p.nome}</h3>
                    <p style={{ fontSize: 13, color: "var(--suave)", marginTop: 4 }}>{p.cargo}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
