/**
 * Edge Function `render-card`.
 *
 * Recebe uma prancha, acha uma foto real, compõe a arte, rasteriza em
 * JPEG 1080x1350, sobe no bucket público `publicacoes` e grava a linha em
 * `assets` com o crédito do fotógrafo.
 *
 * Entrada (POST, JSON):
 *   { publicacao_id: uuid, ordem: int >= 1, total?: int, card: {...} }
 *
 * Saída:
 *   { url_publica, fonte_foto, credito_fotografo, largura, altura, bytes }
 *
 * Só aceita chamada com a service role key no Authorization. Quem chama é
 * o n8n e o servidor do site, nunca o navegador.
 */

import { createClient } from "@supabase/supabase-js";

import { montarSvg, type Card } from "./arte.ts";
import { paraBase64 } from "./base64.ts";
import { buscarFoto } from "./fotos.ts";
import { prepararRasterizador, svgParaJpeg } from "./imagem.ts";
import { buffersDeFonte, fontesDaMarca } from "./marca.ts";

/** O binário Wasm do resvg, buscado uma vez por cold start. */
const WASM = "https://cdn.jsdelivr.net/npm/@resvg/resvg-wasm@2.6.2/index_bg.wasm";

const BUCKET = "publicacoes";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

function json(corpo: unknown, status = 200): Response {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** Comparação de segredo sem vazar em quanto tempo ela falha. */
function iguais(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diferenca = 0;
  for (let i = 0; i < a.length; i++) diferenca |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diferenca === 0;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method !== "POST") return json({ erro: "Use POST" }, 405);

  if (!SUPABASE_URL || !SERVICE_ROLE) {
    return json({ erro: "Função sem SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY" }, 500);
  }
  if (!iguais(req.headers.get("Authorization") ?? "", `Bearer ${SERVICE_ROLE}`)) {
    return json({ erro: "Não autorizado" }, 401);
  }

  let corpo: {
    publicacao_id?: string;
    ordem?: number;
    total?: number;
    card?: Card;
  };
  try {
    corpo = await req.json();
  } catch {
    return json({ erro: "JSON inválido" }, 400);
  }

  const publicacaoId = String(corpo.publicacao_id ?? "");
  const ordem = Number(corpo.ordem);
  const card = corpo.card;

  if (!UUID.test(publicacaoId)) return json({ erro: "publicacao_id inválido" }, 400);
  if (!Number.isInteger(ordem) || ordem < 1) return json({ erro: "ordem inválida" }, 400);
  if (!card?.titulo?.trim()) return json({ erro: "card.titulo obrigatório" }, 400);
  if (!card?.busca_foto?.trim()) return json({ erro: "card.busca_foto obrigatório" }, 400);

  const total = Number.isInteger(corpo.total) && corpo.total! >= ordem ? corpo.total! : ordem;

  try {
    // 1. Foto real. Falhou nas duas fontes, para tudo: não existe plano C.
    const foto = await buscarFoto(card.busca_foto, {
      pexels: Deno.env.get("PEXELS_API_KEY") ?? undefined,
      unsplash: Deno.env.get("UNSPLASH_ACCESS_KEY") ?? undefined,
    });

    // 2. Arte e rasterização.
    const svg = montarSvg({
      card: { ...card, ordem },
      fotoBase64: paraBase64(foto.bytes),
      fotoMime: foto.mime,
      total,
      fontes: fontesDaMarca,
    });

    await prepararRasterizador(fetch(WASM));
    const jpeg = await svgParaJpeg(svg, buffersDeFonte);

    // 3. Storage. O caminho é estável, então rerrenderizar sobrescreve.
    const sb = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
    const caminho = `${publicacaoId}/${ordem}.jpg`;

    const { error: erroUpload } = await sb.storage.from(BUCKET).upload(caminho, jpeg.bytes, {
      contentType: "image/jpeg",
      cacheControl: "31536000",
      upsert: true,
    });
    if (erroUpload) throw new Error(`Storage: ${erroUpload.message}`);

    // O ?v= garante que a aprovação veja a arte recém-gerada, e não uma
    // versão anterior guardada no CDN.
    const base = sb.storage.from(BUCKET).getPublicUrl(caminho).data.publicUrl;
    const urlPublica = `${base}?v=${Date.now()}`;

    // 4. Registro, com o crédito do fotógrafo.
    const { error: erroAsset } = await sb.from("assets").upsert(
      {
        publicacao_id: publicacaoId,
        ordem,
        url_publica: urlPublica,
        fonte_foto: foto.fonte,
        credito_fotografo: foto.creditoFotografo,
        url_original_foto: foto.urlOriginal,
      },
      { onConflict: "publicacao_id,ordem" },
    );
    if (erroAsset) throw new Error(`Banco: ${erroAsset.message}`);

    return json({
      url_publica: urlPublica,
      fonte_foto: foto.fonte,
      credito_fotografo: foto.creditoFotografo,
      largura: jpeg.largura,
      altura: jpeg.altura,
      bytes: jpeg.bytes.byteLength,
    });
  } catch (erro) {
    const detalhe = erro instanceof Error ? erro.message : String(erro);
    console.error("render-card falhou:", detalhe);
    return json({ erro: detalhe }, 502);
  }
});
