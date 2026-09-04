/**
 * Gera `fontes.ts` — as fontes da marca embutidas em base64.
 *
 * Por que embutir em vez de ler arquivo:
 * a Edge Function roda em Deno, e ler arquivo estático no deploy exige
 * `static_files` no config.toml, CLI 2.7+ e Docker. Embutido em um módulo
 * TypeScript, funciona em qualquer caminho de deploy (painel, CLI ou API)
 * e sem nenhuma chamada de rede no cold start.
 *
 * As fontes vêm da API do Google Fonts já subsetadas para o alfabeto que a
 * arte usa (latino + acentuação do português + pontuação), o que derruba o
 * tamanho de centenas de KB para algumas dezenas.
 *
 * Rodar com:  npx tsx supabase/functions/render-card/gerar-fontes.ts
 * Só precisa rodar de novo se mudar a tipografia da marca.
 */

import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Alfabeto que a arte precisa saber desenhar. */
const ALFABETO = [
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "abcdefghijklmnopqrstuvwxyz",
  "ÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ",
  "áàâãäéèêëíìîïóòôõöúùûüçñ",
  "0123456789",
  " .,;:!?'\"()[]{}/\\-–—+*=%$@#&_<>|~^`ºª°§€£¢…«»“”‘’•",
].join("");

const FAMILIAS = [
  { chave: "cormorantSemiBold", familia: "Cormorant+Garamond", peso: 600 },
  { chave: "interLight", familia: "Inter", peso: 300 },
  { chave: "interSemiBold", familia: "Inter", peso: 600 },
] as const;

/**
 * A API do Google devolve woff2 para navegador moderno e TrueType para
 * user agent antigo. O resvg só lê TrueType, então pedimos como antigo.
 */
const UA_ANTIGO = "Mozilla/5.0";

async function baixar(familia: string, peso: number): Promise<Uint8Array> {
  const alvo = new URL("https://fonts.googleapis.com/css2");
  alvo.searchParams.set("family", `${familia.replace(/\+/g, " ")}:wght@${peso}`);
  alvo.searchParams.set("text", ALFABETO);

  const css = await fetch(alvo, { headers: { "User-Agent": UA_ANTIGO } });
  if (!css.ok) throw new Error(`Google Fonts respondeu ${css.status} para ${familia} ${peso}`);

  const url = (await css.text()).match(/https:\/\/fonts\.gstatic\.com\/[^)]+/)?.[0];
  if (!url) throw new Error(`Não achei a URL do TrueType de ${familia} ${peso}`);

  const ttf = await fetch(url);
  if (!ttf.ok) throw new Error(`Download do TrueType falhou (${ttf.status}) para ${familia} ${peso}`);
  return new Uint8Array(await ttf.arrayBuffer());
}

async function main(): Promise<void> {
  const aqui = path.dirname(fileURLToPath(import.meta.url));

  const blocos: string[] = [];
  for (const { chave, familia, peso } of FAMILIAS) {
    const bytes = await baixar(familia, peso);
    const nome = `${familia.replace(/\+/g, " ")} ${peso}`;
    console.log(`${nome.padEnd(28)} ${String(bytes.length).padStart(7)} bytes`);
    blocos.push(
      `/** ${nome} — subset do alfabeto da arte. */\n` +
        `const ${chave}B64 =\n  "${Buffer.from(bytes).toString("base64")}";`,
    );
  }

  const final = `// GERADO POR gerar-fontes.ts — NÃO EDITE À MÃO.
// Fontes da marca em base64, subsetadas para o alfabeto da arte.
// Cormorant Garamond e Inter são licenciadas sob a SIL Open Font License 1.1
// (veja OFL.txt nesta pasta), que permite redistribuição embutida.

${blocos.join("\n\n")}

function paraBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

/** Cormorant Garamond SemiBold — títulos. */
export const CORMORANT_SEMIBOLD: Uint8Array = paraBytes(cormorantSemiBoldB64);
/** Inter Light — corpo de texto. */
export const INTER_LIGHT: Uint8Array = paraBytes(interLightB64);
/** Inter SemiBold — etiquetas pequenas e numeração. */
export const INTER_SEMIBOLD: Uint8Array = paraBytes(interSemiBoldB64);

/** Todas as fontes, na ordem em que o rasterizador deve carregá-las. */
export const FONTES: Uint8Array[] = [CORMORANT_SEMIBOLD, INTER_LIGHT, INTER_SEMIBOLD];
`;

  await writeFile(path.join(aqui, "fontes.ts"), final, "utf8");
  console.log("fontes.ts gerado");
}

main().catch((erro) => {
  console.error(erro instanceof Error ? erro.message : erro);
  process.exit(1);
});
