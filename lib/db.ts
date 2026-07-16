import { neon } from "@neondatabase/serverless";
import { promises as fs } from "fs";
import path from "path";

/**
 * Banco de leads.
 * - Em produção (Vercel): usa Postgres (Neon) via DATABASE_URL.
 * - Em desenvolvimento sem banco: salva em .data/leads.json (arquivo local).
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

function sql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

async function garantirTabela() {
  const db = sql();
  if (!db) return;
  await db`
    CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY,
      criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      nome TEXT NOT NULL,
      whatsapp TEXT NOT NULL,
      dados_obra JSONB NOT NULL DEFAULT '{}',
      resultado JSONB NOT NULL DEFAULT '{}',
      origem TEXT,
      consentimento BOOLEAN NOT NULL DEFAULT FALSE
    )
  `;
}

export async function salvarLead(lead: Lead): Promise<void> {
  const db = sql();
  if (db) {
    await garantirTabela();
    await db`
      INSERT INTO leads (nome, whatsapp, dados_obra, resultado, origem, consentimento)
      VALUES (${lead.nome}, ${lead.whatsapp}, ${JSON.stringify(lead.dados_obra)},
              ${JSON.stringify(lead.resultado)}, ${lead.origem ?? null}, ${lead.consentimento})
    `;
    return;
  }
  // Fallback local (desenvolvimento sem banco)
  await fs.mkdir(path.dirname(ARQUIVO_LOCAL), { recursive: true });
  let atuais: Lead[] = [];
  try {
    atuais = JSON.parse(await fs.readFile(ARQUIVO_LOCAL, "utf8"));
  } catch {
    /* arquivo ainda não existe */
  }
  atuais.push({
    ...lead,
    id: atuais.length + 1,
    criado_em: new Date().toISOString(),
  });
  await fs.writeFile(ARQUIVO_LOCAL, JSON.stringify(atuais, null, 2));
}

export async function listarLeads(): Promise<Lead[]> {
  const db = sql();
  if (db) {
    await garantirTabela();
    const linhas = await db`SELECT * FROM leads ORDER BY criado_em DESC`;
    return linhas as unknown as Lead[];
  }
  try {
    const leads: Lead[] = JSON.parse(await fs.readFile(ARQUIVO_LOCAL, "utf8"));
    return leads.reverse();
  } catch {
    return [];
  }
}
