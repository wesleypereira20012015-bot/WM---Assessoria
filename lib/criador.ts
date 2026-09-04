import { supabaseService } from "./supabase";

/**
 * Dados da Área do Criador.
 *
 * Tudo aqui roda SÓ no servidor, com a service_role, atrás do cookie de
 * administrador. As tabelas têm RLS sem policy nenhuma, então o navegador
 * não consegue falar com o banco nem se quisesse, e nenhuma chave chega ao
 * bundle do cliente.
 *
 * Mesmo padrão de lib/db.ts: funções nomeadas, erro com prefixo "Supabase:".
 */

export type StatusIdeia = "nova" | "em_producao" | "descartada";
export type StatusPublicacao =
  | "rascunho"
  | "aguardando_aprovacao"
  | "aprovada"
  | "reprovada"
  | "agendada"
  | "publicada"
  | "erro";

export interface Ideia {
  id: string;
  titulo: string;
  descricao: string | null;
  origem: "manual" | "instagram" | "noticia";
  status: StatusIdeia;
  prioridade: number;
  criado_em: string;
}

export interface Card {
  ordem: number;
  tipo?: string;
  titulo: string;
  corpo?: string;
  busca_foto: string;
}

export interface Asset {
  id: string;
  publicacao_id: string;
  ordem: number;
  url_publica: string;
  fonte_foto: "pexels" | "unsplash";
  credito_fotografo: string;
  url_original_foto: string | null;
}

export interface Publicacao {
  id: string;
  ideia_id: string | null;
  formato: "carrossel" | "reel";
  titulo_interno: string;
  legenda: string | null;
  hashtags: string[];
  roteiro: unknown;
  cards: Card[] | null;
  status: StatusPublicacao;
  motivo_reprovacao: string | null;
  aprovada_em: string | null;
  agendada_para: string | null;
  publicada_em: string | null;
  ig_media_id: string | null;
  erro_detalhe: string | null;
  criado_em: string;
  assets?: Asset[];
}

export interface Referencia {
  id: string;
  perfil: string;
  url: string;
  legenda: string | null;
  curtidas: number;
  comentarios: number;
  score_engajamento: number;
  publicado_em: string | null;
  coletado_em: string;
  tipo: "reel" | "carrossel" | "imagem" | null;
}

/** Cliente com service_role. Sem ele, a Área do Criador não funciona. */
function sb() {
  const cliente = supabaseService();
  if (!cliente) {
    throw new Error(
      "Área do Criador sem acesso ao banco: falta SUPABASE_URL (ou NEXT_PUBLIC_SUPABASE_URL) e SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  return cliente;
}

/** True quando dá para conversar com o banco. Usado para avisar na tela. */
export function criadorConfigurado(): boolean {
  return supabaseService() !== null;
}

function erro(contexto: string, mensagem: string): never {
  throw new Error(`Supabase (${contexto}): ${mensagem}`);
}

// ------------------------------------------------------------------
// Ideias
// ------------------------------------------------------------------

/** Ideias vivas, as mais prioritárias primeiro. */
export async function listarIdeias(incluirDescartadas = false): Promise<Ideia[]> {
  let consulta = sb()
    .from("ideias")
    .select("*")
    .order("prioridade", { ascending: false })
    .order("criado_em", { ascending: false });

  if (!incluirDescartadas) consulta = consulta.neq("status", "descartada");

  const { data, error } = await consulta;
  if (error) erro("listarIdeias", error.message);
  return (data ?? []) as Ideia[];
}

/** Joga uma ideia na fila. É a operação mais usada da área. */
export async function criarIdeia(titulo: string, descricao?: string): Promise<void> {
  const limpo = titulo.trim().slice(0, 300);
  if (limpo.length < 3) throw new Error("Escreva um pouco mais que isso.");

  const { error } = await sb()
    .from("ideias")
    .insert({
      titulo: limpo,
      descricao: descricao?.trim().slice(0, 4000) || null,
      origem: "manual",
    });
  if (error) erro("criarIdeia", error.message);
}

/** Sobe ou desce a ideia na fila. */
export async function moverPrioridade(id: string, delta: number): Promise<void> {
  const cliente = sb();
  const { data, error: erroLeitura } = await cliente
    .from("ideias")
    .select("prioridade")
    .eq("id", id)
    .single();
  if (erroLeitura) erro("moverPrioridade", erroLeitura.message);

  const { error } = await cliente
    .from("ideias")
    .update({ prioridade: (data?.prioridade ?? 0) + delta })
    .eq("id", id);
  if (error) erro("moverPrioridade", error.message);
}

export async function descartarIdeia(id: string): Promise<void> {
  const { error } = await sb().from("ideias").update({ status: "descartada" }).eq("id", id);
  if (error) erro("descartarIdeia", error.message);
}

// ------------------------------------------------------------------
// Publicações
// ------------------------------------------------------------------

const CAMPOS_PUBLICACAO = "*, assets(*)";

function ordenarAssets(publicacoes: Publicacao[]): Publicacao[] {
  for (const p of publicacoes) {
    p.assets?.sort((a, b) => a.ordem - b.ordem);
    p.cards?.sort((a, b) => a.ordem - b.ordem);
  }
  return publicacoes;
}

/** As que estão esperando o seu aval. */
export async function listarAguardandoAprovacao(): Promise<Publicacao[]> {
  const { data, error } = await sb()
    .from("publicacoes")
    .select(CAMPOS_PUBLICACAO)
    .eq("status", "aguardando_aprovacao")
    .order("criado_em", { ascending: true });
  if (error) erro("listarAguardandoAprovacao", error.message);
  return ordenarAssets((data ?? []) as Publicacao[]);
}

/** O que está agendado ou já foi publicado, para o calendário. */
export async function listarAgenda(desde: Date, ate: Date): Promise<Publicacao[]> {
  const { data, error } = await sb()
    .from("publicacoes")
    .select(CAMPOS_PUBLICACAO)
    .in("status", ["agendada", "publicada", "erro", "aprovada"])
    .or(
      `and(agendada_para.gte.${desde.toISOString()},agendada_para.lte.${ate.toISOString()}),` +
        `and(publicada_em.gte.${desde.toISOString()},publicada_em.lte.${ate.toISOString()})`,
    );
  if (error) erro("listarAgenda", error.message);
  return ordenarAssets((data ?? []) as Publicacao[]);
}

/**
 * Aprova e agenda. O carimbo de aprovação e a data vão na mesma escrita:
 * o banco recusa `agendada` sem `aprovada_em`, então não existe janela em
 * que a publicação fique agendada sem aprovação registrada.
 */
export async function aprovarEAgendar(id: string, quando: Date): Promise<void> {
  if (Number.isNaN(quando.getTime())) throw new Error("Data de agendamento inválida.");

  const { error } = await sb()
    .from("publicacoes")
    .update({
      status: "agendada",
      aprovada_em: new Date().toISOString(),
      agendada_para: quando.toISOString(),
      motivo_reprovacao: null,
    })
    .eq("id", id)
    .eq("status", "aguardando_aprovacao");
  if (error) erro("aprovarEAgendar", error.message);
}

export async function reprovar(id: string, motivo: string): Promise<void> {
  const limpo = motivo.trim().slice(0, 2000);
  if (limpo.length < 3) throw new Error("Diga o motivo, nem que seja em duas palavras.");

  const { error } = await sb()
    .from("publicacoes")
    .update({ status: "reprovada", motivo_reprovacao: limpo })
    .eq("id", id);
  if (error) erro("reprovar", error.message);
}

/** Edição de legenda antes de aprovar. Salva direto no banco. */
export async function salvarLegenda(
  id: string,
  legenda: string,
  hashtags: string[],
): Promise<void> {
  const { error } = await sb()
    .from("publicacoes")
    .update({
      legenda: legenda.trim().slice(0, 2200), // limite do Instagram
      hashtags: hashtags.slice(0, 30), // limite do Instagram
    })
    .eq("id", id);
  if (error) erro("salvarLegenda", error.message);
}

// ------------------------------------------------------------------
// Referências
// ------------------------------------------------------------------

/** Posts dos concorrentes, do mais engajado para o menos. */
export async function listarReferencias(limite = 60): Promise<Referencia[]> {
  const { data, error } = await sb()
    .from("referencias")
    .select("*")
    .order("score_engajamento", { ascending: false })
    .limit(limite);
  if (error) erro("listarReferencias", error.message);
  return (data ?? []) as Referencia[];
}

// ------------------------------------------------------------------
// Apoio para a interface
// ------------------------------------------------------------------

/** Texto curto do status, do jeito que aparece na tela. */
export const ROTULO_STATUS: Record<StatusPublicacao, string> = {
  rascunho: "Rascunho",
  aguardando_aprovacao: "Aguardando aprovação",
  aprovada: "Aprovada",
  reprovada: "Reprovada",
  agendada: "Agendada",
  publicada: "Publicada",
  erro: "Erro",
};

/** Cor do status, usando as variáveis que o site já tem. */
export const COR_STATUS: Record<StatusPublicacao, string> = {
  rascunho: "var(--suave)",
  aguardando_aprovacao: "var(--ouro-500)",
  aprovada: "var(--ok)",
  reprovada: "var(--erro)",
  agendada: "var(--acento)",
  publicada: "var(--ok)",
  erro: "var(--erro)",
};

/** Hashtags digitadas em texto livre viram lista limpa, sem "#" repetido. */
export function lerHashtags(texto: string): string[] {
  return texto
    .split(/[\s,]+/)
    .map((t) => t.replace(/^#+/, "").trim())
    .filter(Boolean)
    .map((t) => `#${t}`);
}
