/**
 * SVG -> JPEG.
 *
 * O resvg rasteriza em PNG; o imagescript converte para JPEG, que é o
 * formato que o Instagram aceita para publicação. Por isso a prancha sai
 * sempre .jpg, nunca .png.
 *
 * O binário Wasm do resvg é carregado uma vez por processo. Quem chama
 * decide de onde ele vem, porque o caminho muda entre a Edge Function
 * (busca por URL) e o teste local (lê de node_modules).
 */

import { initWasm, Resvg } from "@resvg/resvg-wasm";
import { Image } from "imagescript";

import { ALTURA, LARGURA } from "./arte.ts";

/** Qualidade do JPEG. 88 equilibra nitidez do texto e peso do arquivo. */
export const QUALIDADE_JPEG = 88;

let iniciado = false;

/**
 * Carrega o Wasm do resvg. Idempotente: pode chamar quantas vezes quiser,
 * só a primeira faz trabalho.
 */
export async function prepararRasterizador(
  origemWasm: ArrayBuffer | Uint8Array | Response | Promise<Response>,
): Promise<void> {
  if (iniciado) return;
  // deno-lint-ignore no-explicit-any
  await initWasm(origemWasm as any);
  iniciado = true;
}

export interface Rasterizada {
  bytes: Uint8Array;
  largura: number;
  altura: number;
}

/** Rasteriza a prancha e devolve o JPEG pronto para subir no Storage. */
export async function svgParaJpeg(svg: string, fontes: Uint8Array[]): Promise<Rasterizada> {
  if (!iniciado) {
    throw new Error("Rasterizador não iniciado: chame prepararRasterizador antes");
  }

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: LARGURA },
    // Só as fontes da marca. Sem fonte do sistema, o resultado é idêntico
    // aqui e na Edge Function, que não tem fonte nenhuma instalada.
    //
    // Atenção ao manter isto: o resvg não reclama de família desconhecida,
    // ele cai calado na primeira fonte carregada. Por isso o teste local
    // compara a prancha com o título em Cormorant e em Inter, para provar
    // que as famílias estão mesmo sendo distinguidas.
    font: { fontBuffers: fontes, defaultFontFamily: "Inter Light" },
    textRendering: 2, // geometricPrecision: texto pequeno sai mais limpo
  });

  const png = resvg.render().asPng();
  const imagem = await Image.decode(png);
  const bytes = await imagem.encodeJPEG(QUALIDADE_JPEG);

  if (imagem.width !== LARGURA || imagem.height !== ALTURA) {
    throw new Error(
      `Prancha saiu ${imagem.width}x${imagem.height}, esperado ${LARGURA}x${ALTURA}`,
    );
  }

  return { bytes, largura: imagem.width, altura: imagem.height };
}
