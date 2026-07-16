import { revalidatePath } from "next/cache";
import { autenticar, estaAutenticado, sair } from "@/lib/admin-auth";
import { listarLeads } from "@/lib/db";

export const metadata = { title: "Leads · WM Assessoria", robots: { index: false } };
export const dynamic = "force-dynamic";

async function acaoEntrar(formData: FormData) {
  "use server";
  await autenticar(String(formData.get("senha") ?? ""));
  revalidatePath("/admin");
}

async function acaoSair() {
  "use server";
  await sair();
  revalidatePath("/admin");
}

/** Painel simples de consulta dos leads capturados pelo site. */
export default async function AdminPage() {
  const autenticado = await estaAutenticado();

  if (!autenticado) {
    return (
      <main className="container section" style={{ maxWidth: 460 }}>
        <h1 className="display" style={{ fontSize: 26 }}>
          Área <span className="g">restrita</span>
        </h1>
        <p style={{ margin: "12px 0 24px", fontSize: 14.5 }}>
          Digite a senha de administrador para ver os leads.
          {!process.env.ADMIN_PASSWORD && (
            <strong style={{ color: "var(--atencao)", display: "block", marginTop: 8 }}>
              Atenção: a variável ADMIN_PASSWORD ainda não foi configurada (.env.local ou Vercel).
            </strong>
          )}
        </p>
        <form action={acaoEntrar} style={{ display: "grid", gap: 14 }}>
          <div className="field">
            <label htmlFor="senha">Senha</label>
            <input id="senha" name="senha" type="password" className="input" autoFocus />
          </div>
          <button type="submit" className="btn btn-ouro">
            Entrar
          </button>
        </form>
      </main>
    );
  }

  const leads = await listarLeads();

  return (
    <main className="container section">
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 32 }}>
        <h1 className="display" style={{ fontSize: 26 }}>
          Leads <span className="g">({leads.length})</span>
        </h1>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          <a href="/admin/csv" className="btn btn-ghost btn-compacto">
            Baixar CSV
          </a>
          <form action={acaoSair}>
            <button type="submit" className="btn btn-ghost btn-compacto">
              Sair
            </button>
          </form>
        </div>
      </div>

      {leads.length === 0 ? (
        <p>Nenhum lead ainda. Quando alguém usar a calculadora ou o formulário, aparece aqui.</p>
      ) : (
        <div style={{ overflowX: "auto", border: "1px solid var(--linha)", borderRadius: 16 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, minWidth: 760 }}>
            <thead>
              <tr style={{ background: "var(--marinho-800)" }}>
                {["Data", "Nome", "WhatsApp", "Obra", "Resultado", "Origem"].map((h) => (
                  <th
                    key={h}
                    className="mono"
                    style={{
                      textAlign: "left",
                      padding: "12px 16px",
                      fontSize: 10.5,
                      color: "var(--ouro-400)",
                      borderBottom: "1px solid var(--linha)",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map((l, i) => (
                <tr key={l.id ?? i} style={{ borderBottom: "1px solid var(--linha)" }}>
                  <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                    {l.criado_em ? new Date(l.criado_em).toLocaleString("pt-BR") : "—"}
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--titulo)", fontWeight: 600 }}>{l.nome}</td>
                  <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                    <a href={`https://wa.me/55${String(l.whatsapp).replace(/\D/g, "").replace(/^55/, "")}`} target="_blank" rel="noopener noreferrer">
                      {l.whatsapp}
                    </a>
                  </td>
                  <td style={{ padding: "12px 16px", maxWidth: 260 }}>
                    {Object.entries(l.dados_obra ?? {})
                      .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`)
                      .join(" · ") || "—"}
                  </td>
                  <td style={{ padding: "12px 16px", maxWidth: 240 }}>
                    {Object.entries(l.resultado ?? {})
                      .map(([k, v]) => `${k.replace(/_/g, " ")}: ${typeof v === "number" ? v.toLocaleString("pt-BR") : v}`)
                      .join(" · ") || "—"}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--suave)" }}>{l.origem ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
