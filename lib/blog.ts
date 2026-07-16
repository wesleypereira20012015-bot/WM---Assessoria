import { readdirSync, readFileSync } from "fs";
import path from "path";

/**
 * Blog em arquivos de texto: cada arquivo .md dentro de content/blog/
 * vira um artigo automaticamente. O nome do arquivo vira o endereço:
 *   content/blog/o-que-e-cnd.md  →  seusite.com.br/blog/o-que-e-cnd
 *
 * O topo do arquivo (entre --- e ---) traz os dados do artigo:
 *   titulo, descricao, data (AAAA-MM-DD) e capa (opcional).
 */

export interface Post {
  slug: string;
  titulo: string;
  descricao: string;
  data: string; // AAAA-MM-DD
  capa?: string; // ex.: /images/blog/minha-capa.jpg
  corpo: string; // markdown
}

const PASTA = path.join(process.cwd(), "content", "blog");

function parsear(slug: string, texto: string): Post {
  const m = texto.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  const meta: Record<string, string> = {};
  let corpo = texto;
  if (m) {
    corpo = m[2].trim();
    for (const linha of m[1].split("\n")) {
      const dois = linha.indexOf(":");
      if (dois > 0) {
        meta[linha.slice(0, dois).trim()] = linha.slice(dois + 1).trim();
      }
    }
  }
  return {
    slug,
    titulo: meta.titulo ?? slug.replace(/-/g, " "),
    descricao: meta.descricao ?? "",
    data: meta.data ?? "2026-01-01",
    capa: meta.capa || undefined,
    corpo,
  };
}

/** Todos os artigos, do mais novo para o mais antigo. */
export function listarPosts(): Post[] {
  let arquivos: string[] = [];
  try {
    arquivos = readdirSync(PASTA).filter((f) => f.endsWith(".md"));
  } catch {
    return [];
  }
  return arquivos
    .map((f) => parsear(f.replace(/\.md$/, ""), readFileSync(path.join(PASTA, f), "utf8")))
    .sort((a, b) => (a.data < b.data ? 1 : -1));
}

export function buscarPost(slug: string): Post | null {
  try {
    const texto = readFileSync(path.join(PASTA, `${slug}.md`), "utf8");
    return parsear(slug, texto);
  } catch {
    return null;
  }
}

/** "2026-07-10" → "10 de julho de 2026" */
export function dataPorExtenso(iso: string): string {
  const [ano, mes, dia] = iso.split("-").map(Number);
  const d = new Date(ano, (mes ?? 1) - 1, dia ?? 1);
  return d.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
}
