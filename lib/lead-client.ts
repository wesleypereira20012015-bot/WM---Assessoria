"use client";

/** Utilidades de formulário de lead usadas na calculadora e na faixa CTA. */

/** Máscara de telefone pt-BR: "65999725622" → "(65) 99972-5622" */
export function mascaraWhatsApp(valor: string): string {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function whatsappValido(valor: string): boolean {
  const d = valor.replace(/\D/g, "");
  return d.length === 10 || d.length === 11;
}

/** Lê os parâmetros UTM da URL (origem do lead). */
export function origemUTM(): string {
  if (typeof window === "undefined") return "";
  const p = new URLSearchParams(window.location.search);
  const utm = ["utm_source", "utm_medium", "utm_campaign"]
    .map((k) => (p.get(k) ? `${k}=${p.get(k)}` : null))
    .filter(Boolean)
    .join("&");
  return utm || "site";
}

export interface EnvioLead {
  nome: string;
  whatsapp: string;
  consentimento: boolean;
  dados_obra?: Record<string, unknown>;
  resultado?: Record<string, unknown>;
}

/** Envia o lead para a API. Retorna true se salvou. */
export async function enviarLead(lead: EnvioLead): Promise<boolean> {
  try {
    const resp = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...lead, origem: origemUTM() }),
    });
    return resp.ok;
  } catch {
    return false;
  }
}
