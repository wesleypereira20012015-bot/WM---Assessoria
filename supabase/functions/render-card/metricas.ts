/**
 * Medição de texto a partir do próprio arquivo TrueType.
 *
 * SVG não quebra linha sozinho: quem decide onde a linha corta somos nós.
 * Chutar a largura pela média dos caracteres estoura o texto para fora da
 * prancha em títulos com muitas maiúsculas ou muitos "i". Então lemos as
 * larguras reais dos glifos nas tabelas do TTF (head, hhea, hmtx, cmap) e
 * medimos de verdade.
 *
 * Não considera kerning, que muda a largura em menos de 1%. A margem de
 * segurança de MARGEM_SEGURANCA cobre essa diferença.
 *
 * Puro cálculo, sem I/O: roda igual em Deno e em Node.
 */

const MARGEM_SEGURANCA = 1.02;

interface Tabela {
  offset: number;
  length: number;
}

/** Larguras de glifo de uma fonte, prontas para medir texto. */
export interface Fonte {
  familia: string;
  unidadesPorEm: number;
  /** Largura de avanço por código de caractere, em unidades de fonte. */
  avanco: Map<number, number>;
  avancoPadrao: number;
}

function lerTabelas(d: DataView): Map<string, Tabela> {
  const numTables = d.getUint16(4);
  const tabelas = new Map<string, Tabela>();
  for (let i = 0; i < numTables; i++) {
    const p = 12 + i * 16;
    const tag = String.fromCharCode(
      d.getUint8(p),
      d.getUint8(p + 1),
      d.getUint8(p + 2),
      d.getUint8(p + 3),
    );
    tabelas.set(tag, { offset: d.getUint32(p + 8), length: d.getUint32(p + 12) });
  }
  return tabelas;
}

/** Nome da família (nameID 1), que é como o SVG referencia a fonte. */
function lerFamilia(d: DataView, name: Tabela | undefined): string {
  if (!name) return "";
  const base = name.offset;
  const count = d.getUint16(base + 2);
  const stringOffset = d.getUint16(base + 4);
  for (let i = 0; i < count; i++) {
    const p = base + 6 + i * 12;
    if (d.getUint16(p + 6) !== 1) continue; // nameID 1 = família
    const platform = d.getUint16(p);
    const length = d.getUint16(p + 8);
    const offset = base + stringOffset + d.getUint16(p + 10);
    let texto = "";
    if (platform === 3) {
      // Windows: UTF-16BE
      for (let j = 0; j < length; j += 2) texto += String.fromCharCode(d.getUint16(offset + j));
    } else {
      for (let j = 0; j < length; j++) texto += String.fromCharCode(d.getUint8(offset + j));
    }
    if (texto) return texto;
  }
  return "";
}

/** Mapa caractere -> índice de glifo, pelas tabelas cmap formato 4 e 12. */
function lerCmap(d: DataView, cmap: Tabela): Map<number, number> {
  const mapa = new Map<number, number>();
  const numTables = d.getUint16(cmap.offset + 2);

  let melhor = -1;
  for (let i = 0; i < numTables; i++) {
    const p = cmap.offset + 4 + i * 8;
    const plataforma = d.getUint16(p);
    const codificacao = d.getUint16(p + 2);
    const sub = cmap.offset + d.getUint32(p + 4);
    const formato = d.getUint16(sub);
    const unicode =
      (plataforma === 3 && (codificacao === 1 || codificacao === 10)) || plataforma === 0;
    if (unicode && (formato === 4 || formato === 12)) melhor = sub;
    if (unicode && formato === 12) break; // formato 12 é o mais completo
  }
  if (melhor < 0) return mapa;

  const formato = d.getUint16(melhor);

  if (formato === 12) {
    const nGroups = d.getUint32(melhor + 12);
    for (let i = 0; i < nGroups; i++) {
      const p = melhor + 16 + i * 12;
      const inicio = d.getUint32(p);
      const fim = d.getUint32(p + 4);
      const glifoInicial = d.getUint32(p + 8);
      for (let c = inicio; c <= fim; c++) mapa.set(c, glifoInicial + (c - inicio));
    }
    return mapa;
  }

  // Formato 4
  const segCount = d.getUint16(melhor + 6) / 2;
  const endBase = melhor + 14;
  const startBase = endBase + segCount * 2 + 2;
  const deltaBase = startBase + segCount * 2;
  const rangeBase = deltaBase + segCount * 2;

  for (let i = 0; i < segCount; i++) {
    const fim = d.getUint16(endBase + i * 2);
    const inicio = d.getUint16(startBase + i * 2);
    const delta = d.getInt16(deltaBase + i * 2);
    const rangeOffset = d.getUint16(rangeBase + i * 2);
    if (inicio > fim) continue;
    for (let c = inicio; c <= fim && c !== 0xffff; c++) {
      let glifo: number;
      if (rangeOffset === 0) {
        glifo = (c + delta) & 0xffff;
      } else {
        const pos = rangeBase + i * 2 + rangeOffset + (c - inicio) * 2;
        if (pos + 1 >= d.byteLength) continue;
        glifo = d.getUint16(pos);
        if (glifo !== 0) glifo = (glifo + delta) & 0xffff;
      }
      if (glifo !== 0) mapa.set(c, glifo);
    }
  }
  return mapa;
}

/** Lê as larguras de uma fonte TrueType. */
export function lerFonte(dados: Uint8Array): Fonte {
  const d = new DataView(dados.buffer, dados.byteOffset, dados.byteLength);
  const tabelas = lerTabelas(d);

  const head = tabelas.get("head");
  const hhea = tabelas.get("hhea");
  const hmtx = tabelas.get("hmtx");
  const cmap = tabelas.get("cmap");
  if (!head || !hhea || !hmtx || !cmap) {
    throw new Error("Fonte sem as tabelas head/hhea/hmtx/cmap");
  }

  const unidadesPorEm = d.getUint16(head.offset + 18);
  const numMetrics = d.getUint16(hhea.offset + 34);

  const avancos: number[] = [];
  for (let i = 0; i < numMetrics; i++) avancos.push(d.getUint16(hmtx.offset + i * 4));
  const ultimo = avancos[avancos.length - 1] ?? unidadesPorEm / 2;

  const paraGlifo = lerCmap(d, cmap);
  const avanco = new Map<number, number>();
  for (const [codigo, glifo] of paraGlifo) {
    avanco.set(codigo, glifo < avancos.length ? avancos[glifo] : ultimo);
  }

  return {
    familia: lerFamilia(d, tabelas.get("name")),
    unidadesPorEm,
    avanco,
    avancoPadrao: ultimo,
  };
}

/** Largura de um texto, em px, na fonte e no tamanho dados. */
export function largura(fonte: Fonte, texto: string, tamanho: number, espacamento = 0): number {
  let unidades = 0;
  for (const ch of texto) {
    const codigo = ch.codePointAt(0)!;
    unidades += fonte.avanco.get(codigo) ?? fonte.avancoPadrao;
  }
  const base = (unidades / fonte.unidadesPorEm) * tamanho;
  const extra = espacamento * Math.max(0, [...texto].length - 1);
  return base * MARGEM_SEGURANCA + extra;
}

/**
 * Quebra o texto em linhas que caibam em `larguraMax`.
 * Palavra maior que a linha inteira fica sozinha e estoura, em vez de
 * ser cortada no meio: some texto é pior que uma linha larga demais.
 */
export function quebrarLinhas(
  fonte: Fonte,
  texto: string,
  tamanho: number,
  larguraMax: number,
  espacamento = 0,
): string[] {
  const palavras = texto.split(/\s+/).filter(Boolean);
  const linhas: string[] = [];
  let atual = "";

  for (const palavra of palavras) {
    const tentativa = atual ? `${atual} ${palavra}` : palavra;
    if (largura(fonte, tentativa, tamanho, espacamento) <= larguraMax || !atual) {
      atual = tentativa;
    } else {
      linhas.push(atual);
      atual = palavra;
    }
  }
  if (atual) linhas.push(atual);
  return linhas;
}

/**
 * Acha o maior tamanho de fonte, dentro da faixa dada, em que o texto cabe
 * no número de linhas permitido. É o que impede um título longo de vazar
 * para fora da prancha.
 */
export function ajustarTamanho(
  fonte: Fonte,
  texto: string,
  larguraMax: number,
  linhasMax: number,
  tamanhoIdeal: number,
  tamanhoMinimo: number,
  espacamento = 0,
): { tamanho: number; linhas: string[] } {
  for (let tamanho = tamanhoIdeal; tamanho >= tamanhoMinimo; tamanho -= 2) {
    const linhas = quebrarLinhas(fonte, texto, tamanho, larguraMax, espacamento);
    const cabe =
      linhas.length <= linhasMax &&
      linhas.every((l) => largura(fonte, l, tamanho, espacamento) <= larguraMax);
    if (cabe) return { tamanho, linhas };
  }
  // Nem no menor tamanho coube: corta no limite de linhas para não vazar.
  const linhas = quebrarLinhas(fonte, texto, tamanhoMinimo, larguraMax, espacamento);
  return { tamanho: tamanhoMinimo, linhas: linhas.slice(0, linhasMax) };
}
