import { NextResponse } from "next/server";
import { estaAutenticado } from "@/lib/admin-auth";
import { listarLeads } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Exporta os leads em CSV (Excel) — exige login no /admin. */
export async function GET() {
  if (!(await estaAutenticado())) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }
  const leads = await listarLeads();
  const escapar = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const linhas = [
    ["data", "nome", "whatsapp", "dados_obra", "resultado", "origem", "consentimento"].join(";"),
    ...leads.map((l) =>
      [
        l.criado_em ? new Date(l.criado_em).toLocaleString("pt-BR") : "",
        l.nome,
        l.whatsapp,
        JSON.stringify(l.dados_obra ?? {}),
        JSON.stringify(l.resultado ?? {}),
        l.origem ?? "",
        l.consentimento ? "sim" : "não",
      ]
        .map(escapar)
        .join(";")
    ),
  ];
  // ﻿ (BOM) faz o Excel abrir acentos corretamente
  return new NextResponse("﻿" + linhas.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-wm-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
