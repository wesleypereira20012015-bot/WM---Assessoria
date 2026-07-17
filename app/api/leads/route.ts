import { NextRequest, NextResponse } from "next/server";
import { salvarLead } from "@/lib/db";

/** Recebe leads da calculadora e da faixa CTA. */
export async function POST(req: NextRequest) {
  let corpo: Record<string, unknown>;
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ erro: "JSON inválido" }, { status: 400 });
  }

  const nome = String(corpo.nome ?? "").trim().slice(0, 120);
  const whatsapp = String(corpo.whatsapp ?? "").replace(/\D/g, "");
  const consentimento = corpo.consentimento === true;
  const email = String(corpo.email ?? "").trim().slice(0, 160);
  const situacao = String(corpo.situacao_obra ?? "").trim().slice(0, 2000);

  if (nome.length < 2) {
    return NextResponse.json({ erro: "Nome obrigatório" }, { status: 400 });
  }
  if (whatsapp.length < 10 || whatsapp.length > 13) {
    return NextResponse.json({ erro: "WhatsApp inválido" }, { status: 400 });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ erro: "E-mail inválido" }, { status: 400 });
  }
  if (!consentimento) {
    return NextResponse.json({ erro: "Consentimento obrigatório" }, { status: 400 });
  }

  try {
    await salvarLead({
      nome,
      whatsapp,
      email: email || undefined,
      situacao_obra: situacao || undefined,
      consentimento,
      dados_obra: (corpo.dados_obra as Record<string, unknown>) ?? {},
      resultado: (corpo.resultado as Record<string, unknown>) ?? {},
      origem: String(corpo.origem ?? "site").slice(0, 300),
    });
  } catch (e) {
    console.error("Falha ao salvar lead:", e);
    return NextResponse.json({ erro: "Falha ao salvar" }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
