import React from "react";

/**
 * Renderizador simples de Markdown para os artigos do blog.
 * Suporta: ## títulos, parágrafos, listas (-), citações (>),
 * **negrito**, *itálico*, [links](url) e imagens ![legenda](/images/...).
 */

function inline(texto: string): React.ReactNode[] {
  const nos: React.ReactNode[] = [];
  // imagens, links, negrito, itálico
  const re = /(!\[([^\]]*)\]\(([^)]+)\))|(\[([^\]]+)\]\(([^)]+)\))|(\*\*([^*]+)\*\*)|(\*([^*]+)\*)/g;
  let ultimo = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(texto))) {
    if (m.index > ultimo) nos.push(texto.slice(ultimo, m.index));
    if (m[1]) {
      // imagem
      nos.push(
        // eslint-disable-next-line @next/next/no-img-element
        <img key={k++} src={m[3]} alt={m[2]} loading="lazy" style={{ borderRadius: 12, margin: "8px 0" }} />
      );
    } else if (m[4]) {
      const externo = m[6].startsWith("http");
      nos.push(
        <a key={k++} href={m[6]} target={externo ? "_blank" : undefined} rel={externo ? "noopener noreferrer" : undefined}>
          {m[5]}
        </a>
      );
    } else if (m[7]) {
      nos.push(<strong key={k++} style={{ color: "var(--titulo)" }}>{m[8]}</strong>);
    } else if (m[9]) {
      nos.push(<em key={k++}>{m[10]}</em>);
    }
    ultimo = re.lastIndex;
  }
  if (ultimo < texto.length) nos.push(texto.slice(ultimo));
  return nos;
}

export function Markdown({ texto }: { texto: string }) {
  const blocos = texto.split(/\n\s*\n/);
  return (
    <>
      {blocos.map((bloco, i) => {
        const b = bloco.trim();
        if (!b) return null;
        if (b.startsWith("### ")) {
          return (
            <h3 key={i} style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 24, fontWeight: 600, color: "var(--titulo)", margin: "28px 0 4px" }}>
              {inline(b.slice(4))}
            </h3>
          );
        }
        if (b.startsWith("## ")) {
          return (
            <h2 key={i} style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 30, fontWeight: 600, color: "var(--titulo)", margin: "36px 0 6px" }}>
              {inline(b.slice(3))}
            </h2>
          );
        }
        if (b.startsWith("> ")) {
          return (
            <blockquote
              key={i}
              style={{
                borderLeft: "2px solid var(--acento)",
                padding: "4px 0 4px 20px",
                margin: "16px 0",
                fontFamily: "var(--font-cormorant), serif",
                fontSize: 21,
                fontStyle: "italic",
                color: "var(--titulo)",
              }}
            >
              {inline(b.replace(/^> ?/gm, ""))}
            </blockquote>
          );
        }
        if (/^[-*] /m.test(b)) {
          const itens = b.split("\n").filter((l) => /^[-*] /.test(l.trim()));
          return (
            <ul key={i} style={{ paddingLeft: 22, margin: "12px 0", display: "grid", gap: 8 }}>
              {itens.map((item, j) => (
                <li key={j}>{inline(item.trim().slice(2))}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} style={{ margin: "14px 0" }}>
            {inline(b)}
          </p>
        );
      })}
    </>
  );
}
