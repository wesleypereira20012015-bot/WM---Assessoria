import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Clientes do Supabase.
 * - Público (publishable): respeita as regras de segurança do banco (RLS).
 *   Usado para INSERIR leads — a única operação liberada para o público.
 * - Serviço (service_role): ignora o RLS. Usado SÓ no servidor, para o
 *   painel /admin ler os leads. Nunca deve chegar ao navegador.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** True quando o site está configurado para salvar leads no Supabase. */
export const supabaseConfigurado = Boolean(url && publishable);

/** Cliente público (RLS aplicado) — para inserir leads. */
export function supabaseAnon(): SupabaseClient | null {
  if (!url || !publishable) return null;
  return createClient(url, publishable, { auth: { persistSession: false } });
}

/** Cliente com service_role (ignora RLS) — só no servidor, para ler leads. */
export function supabaseService(): SupabaseClient | null {
  if (!url || !serviceRole) return null;
  return createClient(url, serviceRole, { auth: { persistSession: false } });
}
