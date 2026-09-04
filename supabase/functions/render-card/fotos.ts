/**
 * Busca da foto de fundo.
 *
 * Regra da marca, sem exceção: foto real, de Pexels ou Unsplash. O Pexels é
 * a fonte primária; o Unsplash entra quando o Pexels não devolve nada bom.
 * Se as duas falharem, esta função levanta erro. Nunca inventa imagem e
 * nunca cai para uma imagem gerada.
 *
 * As duas APIs recortam do lado delas, então já pedimos 1080x1350 e o que
 * chega aqui é exatamente o que vai para a prancha.
 */

import { ALTURA, LARGURA } from "./arte.ts";

export interface Foto {
  bytes: Uint8Array;
  mime: string;
  fonte: "pexels" | "unsplash";
  creditoFotografo: string;
  urlOriginal: string;
}

export interface ChavesDeFoto {
  pexels?: string;
  unsplash?: string;
}

/** Peso máximo aceitável para a foto de origem. */
const LIMITE_BYTES = 12 * 1024 * 1024;

async function baixarImagem(url: string): Promise<{ bytes: Uint8Array; mime: string }> {
  const resposta = await fetch(url);
  if (!resposta.ok) throw new Error(`Download da foto falhou (${resposta.status})`);

  const mime = resposta.headers.get("content-type")?.split(";")[0]?.trim() || "image/jpeg";
  if (!mime.startsWith("image/")) throw new Error(`A foto voltou como ${mime}`);

  const bytes = new Uint8Array(await resposta.arrayBuffer());
  if (bytes.byteLength === 0) throw new Error("A foto voltou vazia");
  if (bytes.byteLength > LIMITE_BYTES) throw new Error("A foto veio grande demais");

  return { bytes, mime };
}

async function doPexels(termo: string, chave: string): Promise<Foto> {
  const busca = new URL("https://api.pexels.com/v1/search");
  busca.searchParams.set("query", termo);
  busca.searchParams.set("orientation", "portrait");
  busca.searchParams.set("per_page", "15");

  const resposta = await fetch(busca, { headers: { Authorization: chave } });
  if (!resposta.ok) throw new Error(`Pexels respondeu ${resposta.status}`);

  const dados = await resposta.json() as {
    photos?: Array<{
      width: number;
      height: number;
      url: string;
      photographer: string;
      src: { original: string };
    }>;
  };

  // Só serve foto com resolução suficiente para preencher a prancha.
  const foto = (dados.photos ?? []).find((f) => f.width >= LARGURA && f.height >= ALTURA) ??
    (dados.photos ?? [])[0];
  if (!foto) throw new Error(`Pexels não achou foto para "${termo}"`);

  const recorte = new URL(foto.src.original);
  recorte.search = `auto=compress&cs=tinysrgb&fit=crop&w=${LARGURA}&h=${ALTURA}`;

  const { bytes, mime } = await baixarImagem(recorte.toString());
  return {
    bytes,
    mime,
    fonte: "pexels",
    creditoFotografo: foto.photographer || "Pexels",
    urlOriginal: foto.url,
  };
}

async function doUnsplash(termo: string, chave: string): Promise<Foto> {
  const busca = new URL("https://api.unsplash.com/search/photos");
  busca.searchParams.set("query", termo);
  busca.searchParams.set("orientation", "portrait");
  busca.searchParams.set("per_page", "15");

  const resposta = await fetch(busca, {
    headers: { Authorization: `Client-ID ${chave}`, "Accept-Version": "v1" },
  });
  if (!resposta.ok) throw new Error(`Unsplash respondeu ${resposta.status}`);

  const dados = await resposta.json() as {
    results?: Array<{
      urls: { raw: string };
      links: { html: string; download_location: string };
      user: { name: string };
    }>;
  };

  const foto = (dados.results ?? [])[0];
  if (!foto) throw new Error(`Unsplash não achou foto para "${termo}"`);

  const recorte = `${foto.urls.raw}&fit=crop&crop=entropy&fm=jpg&q=85&w=${LARGURA}&h=${ALTURA}`;
  const { bytes, mime } = await baixarImagem(recorte);

  // O Unsplash exige registrar o download de quem usa a foto. Se essa
  // chamada falhar, a arte continua: ela é obrigação de atribuição, não
  // parte da renderização.
  fetch(foto.links.download_location, {
    headers: { Authorization: `Client-ID ${chave}` },
  }).catch(() => {});

  return {
    bytes,
    mime,
    fonte: "unsplash",
    creditoFotografo: foto.user?.name || "Unsplash",
    urlOriginal: foto.links.html,
  };
}

/**
 * Acha a foto do termo de busca. Tenta Pexels, cai para Unsplash, e desiste
 * com erro se nenhum dos dois servir.
 */
export async function buscarFoto(termo: string, chaves: ChavesDeFoto): Promise<Foto> {
  const falhas: string[] = [];

  if (chaves.pexels) {
    try {
      return await doPexels(termo, chaves.pexels);
    } catch (erro) {
      falhas.push(`Pexels: ${erro instanceof Error ? erro.message : erro}`);
    }
  } else {
    falhas.push("Pexels: PEXELS_API_KEY não configurada");
  }

  if (chaves.unsplash) {
    try {
      return await doUnsplash(termo, chaves.unsplash);
    } catch (erro) {
      falhas.push(`Unsplash: ${erro instanceof Error ? erro.message : erro}`);
    }
  } else {
    falhas.push("Unsplash: UNSPLASH_ACCESS_KEY não configurada");
  }

  throw new Error(`Nenhuma foto real para "${termo}". ${falhas.join(" | ")}`);
}
