import { promises as fs } from "fs";
import path from "path";
import { supabaseAnon, supabaseService, supabaseConfigurado } from "./supabase";

/**
 * Banco de leads.
 * - Produção: Supabase (Postgres com RLS). Inserção pública, leitura protegida.
 * - Desenvolvimento sem Supabase: salva em .data/leads.json (arquivo local).
 */

export interface Lead {
  id?: number;
  criado_em?: string;
  nome: string;
  whatsapp: string;
  dados_obra: Record<string, unknown>;
  resultado: Record<string, unknown>;
  origem?: string;
  consentimento: boolean;
}

const ARQUIVO_LOCAL = path.join(process.cwd(), ".data", "leads.json");

/** Salva um lead (Supabase se configurado; senão, arquivo local). */
export async function salvarLead(lead: Lead): Promise<void> {
  const sb = supabaseAnon();
  if (sb) {
    const { error } = await sb.from("leads").insert({
      nome: lead.nome,
      whatsapp: lead.whatsapp,
      dados_obra: lead.dados_obra,
      resultado: lead.resultado,
      origem: lead.origem ?? null,
      consentimento: lead.consentimento,
    });
    if (error) throw new Error(`Supabase: ${error.message}`);
    return;
  }
  // Fallback local (desenvolvimento sem Supabase)
  await fs.mkdir(path.dirname(ARQUIVO_LOCAL), { recursive: true });
  let atuais: Lead[] = [];
  try {
    atuais = JSON.parse(await fs.readFile(ARQUIVO_LOCAL, "utf8"));
  } catch {
    /* arquivo ainda não existe */
  }
  atuais.push({ ...lead, id: atuais.length + 1, criado_em: new Date().toISOString() });
  await fs.writeFile(ARQUIVO_LOCAL, JSON.stringify(atuais, null, 2));
}

/** Lista os leads para o painel /admin. */
export async function listarLeads(): Promise<Lead[]> {
  const sb = supabaseService();
  if (sb) {
    const { data, error } = await sb
      .from("leads")
      .select("*")
      .order("criado_em", { ascending: false });
    if (error) throw new Error(`Supabase: ${error.message}`);
    return (data ?? []) as Lead[];
  }
  // Supabase salva os leads, mas sem a service_role o /admin não pode lê-los.
  if (supabaseConfigurado) return [];
  // Fallback local
  try {
    const leads: Lead[] = JSON.parse(await fs.readFile(ARQUIVO_LOCAL, "utf8"));
    return leads.reverse();
  } catch {
    return [];
  }
}

/**
 * Onde os leads estão sendo guardados/lidos — usado pelo /admin para
 * mostrar a mensagem certa.
 *  - "supabase"          → lendo do Supabase (service_role configurada)
 *  - "supabase-sem-chave"→ salvando no Supabase, mas sem chave para ler aqui
 *  - "local"             → arquivo .data/leads.json (desenvolvimento)
 */
export function statusLeitura(): "supabase" | "supabase-sem-chave" | "local" {
  if (supabaseService()) return "supabase";
  if (supabaseConfigurado) return "supabase-sem-chave";
  return "local";
}
