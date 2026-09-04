import { criadorConfigurado, listarReferencias, type Referencia } from "@/lib/criador";

/**
 * Aba Referências.
 *
 * Posts dos concorrentes coletados de madrugada, ordenados por engajamento.
 * Serve para olhar e tirar ideia na mão.
 */

const ROTULO_TIPO: Record<string, string> = {
  reel: "Reel",
  carrossel: "Carrossel",
  imagem: "Imagem",
};

function resumo(legenda: string | null): string {
  if (!legenda) return "";
  const limpa = legenda.replace(/\s+/g, " ").trim();
  return limpa.length > 220 ? `${limpa.slice(0, 220)}...` : limpa;
}

export default async function ReferenciasPage() {
  let referencias: Referencia[] = [];
  let falha = "";
  if (criadorConfigurado()) {
    try {
      referencias = await listarReferencias();
    } catch (e) {
      falha = e instanceof Error ? e.message : String(e);
    }
  }

  if (falha) {
    return <p style={{ color: "var(--erro)", fontSize: 14 }}>Não consegui ler as referências. {falha}</p>;
  }

  if (referencias.length === 0) {
    return (
      <p style={{ fontSize: 14.5, color: "var(--suave)" }}>
        Nenhuma referência coletada ainda. A coleta roda de madrugada e traz os posts dos perfis
        concorrentes configurados no n8n.
      </p>
    );
  }

  return (
    <ul style={{ listStyle: "none", display: "grid", gap: 10 }}>
      {referencias.map((r) => (
        <li
          key={r.id}
          style={{
            display: "flex",
            gap: 16,
            padding: "16px 18px",
            border: "1px solid var(--linha)",
            borderRadius: 12,
            background: "var(--card-bg)",
          }}
        >
          <div style={{ minWidth: 62, textAlign: "center" }}>
            <p className="mono" style={{ fontSize: 17, color: "var(--acento)", lineHeight: 1.2 }}>
              {Number(r.score_engajamento).toFixed(1)}
            </p>
            <p style={{ fontSize: 10, color: "var(--suave)" }}>score</p>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 14.5, color: "var(--titulo)", fontWeight: 600 }}>
              {r.perfil}
              {r.tipo && (
                <span
                  className="mono"
                  style={{ fontSize: 10, color: "var(--suave)", marginLeft: 10, fontWeight: 400 }}
                >
                  {ROTULO_TIPO[r.tipo] ?? r.tipo}
                </span>
              )}
            </p>
            {r.legenda && (
              <p style={{ fontSize: 13.5, marginTop: 5, lineHeight: 1.6 }}>{resumo(r.legenda)}</p>
            )}
            <p style={{ fontSize: 12, color: "var(--suave)", marginTop: 7 }}>
              {r.curtidas.toLocaleString("pt-BR")} curtidas ·{" "}
              {r.comentarios.toLocaleString("pt-BR")} comentários
              {r.publicado_em && ` · ${new Date(r.publicado_em).toLocaleDateString("pt-BR")}`}
              {" · "}
              <a href={r.url} target="_blank" rel="noopener noreferrer">
                ver no Instagram
              </a>
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
