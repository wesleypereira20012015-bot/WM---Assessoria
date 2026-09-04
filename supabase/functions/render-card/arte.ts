/**
 * Composição da prancha 1080x1350 em SVG.
 *
 * Só monta string: nada de rede, nada de arquivo. Roda igual em Deno
 * (Edge Function) e em Node (teste local), e é o único lugar que decide
 * como a arte se parece.
 *
 * Identidade visual (fixa, não é configurável por chamada):
 *   marinho #0A1729 · ouro #C9A24A · champagne #EAD79B · creme #F1ECE3
 *   títulos em Cormorant Garamond SemiBold, corpo em Inter Light
 *   monograma WM discreto no rodapé de toda prancha
 */

import { escaparXml, limpar } from "./texto.ts";
import { ajustarTamanho, largura, quebrarLinhas, type Fonte } from "./metricas.ts";

export const LARGURA = 1080;
export const ALTURA = 1350;

export const CORES = {
  marinho: "#0A1729",
  ouro: "#C9A24A",
  champagne: "#EAD79B",
  creme: "#F1ECE3",
} as const;

/** Uma prancha do carrossel, do jeito que vem no campo `cards` do banco. */
export interface Card {
  ordem: number;
  tipo?: string;
  titulo: string;
  corpo?: string;
  busca_foto: string;
}

/** As três fontes da marca, já lidas por metricas.lerFonte. */
export interface FontesDaMarca {
  titulo: Fonte;
  corpo: Fonte;
  etiqueta: Fonte;
}

export interface EntradaArte {
  card: Card;
  /** Foto de fundo, em base64, sem o prefixo data:. */
  fotoBase64: string;
  fotoMime: string;
  /** Total de pranchas do carrossel, para o indicador do rodapé. */
  total: number;
  fontes: FontesDaMarca;
}

// ---- Grade ----
const MOLDURA = 48; // hairline de ouro rente à borda
const MARGEM = 104; // onde o texto começa e termina
const LARGURA_TEXTO = LARGURA - MARGEM * 2;
const RODAPE_Y = 1236; // linha de base do rodapé
const BASE_TEXTO = 1120; // linha de base da última linha de corpo
const GAP_REGUA_TITULO = 52; // da régua de ouro até a 1a linha do título
const REGUA_LARGURA = 64;

/** Escalas por tipo de prancha. A capa fala mais alto que as de dentro. */
function escala(tipo: string) {
  if (tipo === "capa") {
    return {
      tituloIdeal: 92,
      tituloMinimo: 56,
      tituloLinhas: 4,
      tituloEntrelinha: 1.06,
      corpoTamanho: 31,
      corpoLinhas: 3,
      veuTopo: 0.42,
      veuBase: 0.95,
    };
  }
  return {
    tituloIdeal: 66,
    tituloMinimo: 42,
    tituloLinhas: 4,
    tituloEntrelinha: 1.14,
    corpoTamanho: 30,
    corpoLinhas: 5,
    veuTopo: 0.36,
    veuBase: 0.93,
  };
}

/**
 * Monograma oficial da WM, os mesmos traços de components/Logo.tsx.
 * Desenhado num quadro local de (36,28) a (84,92); a transformação encaixa
 * esse quadro na altura pedida.
 */
function monograma(x: number, y: number, alturaAlvo: number): string {
  const s = alturaAlvo / 64;
  const tx = x - 36 * s;
  const ty = y - 28 * s;
  return `<g transform="translate(${tx.toFixed(2)},${ty.toFixed(2)}) scale(${s.toFixed(4)})" fill="none" stroke="${CORES.ouro}" stroke-linejoin="round" opacity="0.92">
    <path d="M42 28L42 92M78 28L78 92M36 28L48 28M72 28L84 28M36 92L48 92M72 92L84 92" stroke-width="4.5"/>
    <path d="M42 28L60 60L78 28M42 92L60 60L78 92" stroke-width="3"/>
  </g>`;
}

function linhasDeTexto(
  linhas: string[],
  baselineFinal: number,
  entrelinha: number,
  atributos: string,
): string {
  return linhas
    .map((linha, i) => {
      const y = baselineFinal - (linhas.length - 1 - i) * entrelinha;
      return `<text x="${MARGEM}" y="${y.toFixed(1)}" ${atributos}>${escaparXml(linha)}</text>`;
    })
    .join("\n    ");
}

/** Monta o SVG completo de uma prancha. */
export function montarSvg(entrada: EntradaArte): string {
  const { card, fotoBase64, fotoMime, total, fontes } = entrada;
  const e = escala(card.tipo ?? "conteudo");

  const titulo = limpar(card.titulo);
  const corpo = limpar(card.corpo ?? "");

  // Título: encolhe até caber no número de linhas permitido.
  const t = ajustarTamanho(
    fontes.titulo,
    titulo,
    LARGURA_TEXTO,
    e.tituloLinhas,
    e.tituloIdeal,
    e.tituloMinimo,
  );
  const entrelinhaTitulo = t.tamanho * e.tituloEntrelinha;

  // Corpo: tamanho fixo, cortado no limite de linhas.
  const corpoLinhas = corpo
    ? quebrarLinhas(fontes.corpo, corpo, e.corpoTamanho, LARGURA_TEXTO).slice(0, e.corpoLinhas)
    : [];
  const entrelinhaCorpo = e.corpoTamanho * 1.5;

  // Empilha de baixo para cima: o bloco fica ancorado no rodapé.
  // O respiro entre título e corpo acompanha o tamanho do título: precisa
  // caber a descida do título (o "g" de "pagando") mais a subida do corpo,
  // e ainda sobrar ar. Um valor fixo aperta nos títulos grandes.
  const gapTituloCorpo = t.tamanho * 0.28 + e.corpoTamanho * 0.75 + 32;

  const primeiraBaseCorpo = BASE_TEXTO - Math.max(0, corpoLinhas.length - 1) * entrelinhaCorpo;
  const ultimaBaseTitulo = corpoLinhas.length
    ? primeiraBaseCorpo - gapTituloCorpo
    : BASE_TEXTO;
  const primeiraBaseTitulo = ultimaBaseTitulo - (t.linhas.length - 1) * entrelinhaTitulo;
  const reguaY = primeiraBaseTitulo - t.tamanho * 0.74 - GAP_REGUA_TITULO;

  const indice = `${String(card.ordem).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
  const larguraIndice = largura(fontes.etiqueta, indice, 18, 3);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${LARGURA}" height="${ALTURA}" viewBox="0 0 ${LARGURA} ${ALTURA}">
  <defs>
    <linearGradient id="veu" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${CORES.marinho}" stop-opacity="${e.veuTopo}"/>
      <stop offset="0.42" stop-color="${CORES.marinho}" stop-opacity="${(e.veuTopo + e.veuBase) / 2 - 0.08}"/>
      <stop offset="1" stop-color="${CORES.marinho}" stop-opacity="${e.veuBase}"/>
    </linearGradient>
    <linearGradient id="brilhoOuro" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${CORES.champagne}"/>
      <stop offset="1" stop-color="${CORES.ouro}"/>
    </linearGradient>
    <!-- Tira um pouco da saturação para fotos de bancos diferentes
         parecerem da mesma campanha. -->
    <filter id="unifica" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feColorMatrix type="saturate" values="0.72"/>
    </filter>
  </defs>

  <rect width="${LARGURA}" height="${ALTURA}" fill="${CORES.marinho}"/>
  <image href="data:${fotoMime};base64,${fotoBase64}" x="0" y="0" width="${LARGURA}" height="${ALTURA}"
         preserveAspectRatio="xMidYMid slice" filter="url(#unifica)"/>
  <rect width="${LARGURA}" height="${ALTURA}" fill="url(#veu)"/>

  <rect x="${MOLDURA}" y="${MOLDURA}" width="${LARGURA - MOLDURA * 2}" height="${ALTURA - MOLDURA * 2}"
        fill="none" stroke="${CORES.ouro}" stroke-opacity="0.34" stroke-width="1"/>

  <rect x="${MARGEM}" y="${reguaY.toFixed(1)}" width="${REGUA_LARGURA}" height="2" fill="url(#brilhoOuro)"/>

  ${linhasDeTexto(
    t.linhas,
    ultimaBaseTitulo,
    entrelinhaTitulo,
    `font-family="${fontes.titulo.familia}" font-weight="600" font-size="${t.tamanho}" fill="${CORES.creme}"`,
  )}

  ${
    corpoLinhas.length
      ? linhasDeTexto(
          corpoLinhas,
          BASE_TEXTO,
          entrelinhaCorpo,
          `font-family="${fontes.corpo.familia}" font-weight="300" font-size="${e.corpoTamanho}" fill="${CORES.creme}" fill-opacity="0.80"`,
        )
      : ""
  }

  ${monograma(MARGEM, RODAPE_Y - 34, 40)}

  <text x="${LARGURA - MARGEM - larguraIndice}" y="${RODAPE_Y}"
        font-family="${fontes.etiqueta.familia}" font-weight="600" font-size="18"
        letter-spacing="3" fill="${CORES.champagne}" fill-opacity="0.72">${escaparXml(indice)}</text>
</svg>`;
}
