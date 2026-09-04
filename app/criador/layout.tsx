import { revalidatePath } from "next/cache";
import { autenticar, estaAutenticado, sair } from "@/lib/admin-auth";
import { criadorConfigurado } from "@/lib/criador";
import Abas from "@/components/criador/Abas";

/**
 * Casca da Área do Criador.
 *
 * A porta é a mesma do /admin: cookie httpOnly com hash da ADMIN_PASSWORD,
 * conferido no servidor. Não há segunda senha e não há login do Supabase.
 * Todas as páginas filhas são Server Components, então nada de banco nem
 * de chave passa pelo navegador.
 */

export const metadata = {
  title: "Área do Criador · WM Assessoria",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

async function acaoEntrar(formData: FormData) {
  "use server";
  await autenticar(String(formData.get("senha") ?? ""));
  revalidatePath("/criador", "layout");
}

async function acaoSair() {
  "use server";
  await sair();
  revalidatePath("/criador", "layout");
}

export default async function CriadorLayout({ children }: { children: React.ReactNode }) {
  if (!(await estaAutenticado())) {
    return (
      <main className="container section" style={{ maxWidth: 460 }}>
        <h1 className="display" style={{ fontSize: 26 }}>
          Área do <span className="g">Criador</span>
        </h1>
        <p style={{ margin: "12px 0 24px", fontSize: 14.5 }}>
          Digite a senha de administrador.
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

  return (
    <main className="container section">
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        <h1 className="display" style={{ fontSize: 26 }}>
          Área do <span className="g">Criador</span>
        </h1>
        <span style={{ fontSize: 13, color: "var(--suave)" }}>4 publicações por semana</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          <a href="/admin" className="btn btn-ghost btn-compacto">
            Leads
          </a>
          <form action={acaoSair}>
            <button type="submit" className="btn btn-ghost btn-compacto">
              Sair
            </button>
          </form>
        </div>
      </div>

      <Abas />

      {!criadorConfigurado() && (
        <div
          style={{
            padding: "16px 20px",
            marginBottom: 28,
            border: "1px solid var(--linha-forte)",
            borderRadius: 12,
            background: "var(--card-bg)",
            fontSize: 14.5,
            lineHeight: 1.7,
          }}
        >
          <strong style={{ color: "var(--atencao)" }}>Sem conexão com o banco.</strong> Falta{" "}
          <code>SUPABASE_SERVICE_ROLE_KEY</code> (e <code>SUPABASE_URL</code> ou{" "}
          <code>NEXT_PUBLIC_SUPABASE_URL</code>) no ambiente. Enquanto isso as abas ficam vazias.
        </div>
      )}

      {children}
    </main>
  );
}
