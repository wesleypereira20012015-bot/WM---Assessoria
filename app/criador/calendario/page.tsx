import Link from "next/link";
import {
  COR_STATUS,
  ROTULO_STATUS,
  criadorConfigurado,
  listarAgenda,
  type Publicacao,
} from "@/lib/criador";

/**
 * Aba Calendário.
 *
 * Visão de uma semana por vez: o que está agendado, o que já saiu e o que
 * deu erro, com o motivo do erro à vista.
 */

const DIAS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

/** Segunda-feira da semana, com deslocamento em semanas. */
function segundaDaSemana(deslocamento: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  // getDay(): 0 = domingo. Queremos a semana começando na segunda.
  const desdeSegunda = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - desdeSegunda + deslocamento * 7);
  return d;
}

/** Quando a publicação acontece: a data real se já saiu, senão a agendada. */
function quando(p: Publicacao): Date | null {
  const iso = p.publicada_em ?? p.agendada_para;
  return iso ? new Date(iso) : null;
}

export default async function CalendarioPage({
  searchParams,
}: {
  searchParams: Promise<{ semana?: string }>;
}) {
  const { semana } = await searchParams;
  const deslocamento = Number.parseInt(semana ?? "0", 10) || 0;

  const inicio = segundaDaSemana(deslocamento);
  const fim = new Date(inicio);
  fim.setDate(fim.getDate() + 7);

  let publicacoes: Publicacao[] = [];
  let falha = "";
  if (criadorConfigurado()) {
    try {
      publicacoes = await listarAgenda(inicio, fim);
    } catch (e) {
      falha = e instanceof Error ? e.message : String(e);
    }
  }

  const dias = DIAS.map((nome, i) => {
    const dia = new Date(inicio);
    dia.setDate(dia.getDate() + i);
    const doDia = publicacoes
      .filter((p) => {
        const q = quando(p);
        return q && q.toDateString() === dia.toDateString();
      })
      .sort((a, b) => (quando(a)!.getTime() - quando(b)!.getTime()));
    return { nome, dia, publicacoes: doDia };
  });

  const hoje = new Date().toDateString();
  const rotuloSemana = `${inicio.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} a ${new Date(fim.getTime() - 1).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}`;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link href={`/criador/calendario?semana=${deslocamento - 1}`} className="btn btn-ghost btn-compacto">
          ← Semana anterior
        </Link>
        <span style={{ fontSize: 14, color: "var(--titulo)", fontWeight: 600 }}>{rotuloSemana}</span>
        <Link href={`/criador/calendario?semana=${deslocamento + 1}`} className="btn btn-ghost btn-compacto">
          Próxima semana →
        </Link>
        {deslocamento !== 0 && (
          <Link href="/criador/calendario" className="btn btn-ghost btn-compacto">
            Hoje
          </Link>
        )}
        <span style={{ marginLeft: "auto", fontSize: 13, color: "var(--suave)" }}>
          {publicacoes.length} de 4 na semana
        </span>
      </div>

      {falha && (
        <p style={{ color: "var(--erro)", marginBottom: 20, fontSize: 14 }}>
          Não consegui ler o calendário. {falha}
        </p>
      )}

      <div style={{ display: "grid", gap: 10 }}>
        {dias.map(({ nome, dia, publicacoes: doDia }) => (
          <div
            key={nome}
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(120px, 160px) 1fr",
              gap: 16,
              padding: "14px 18px",
              border: "1px solid var(--linha)",
              borderRadius: 12,
              background: dia.toDateString() === hoje ? "var(--card-bg)" : "transparent",
              borderColor: dia.toDateString() === hoje ? "var(--linha-forte)" : "var(--linha)",
            }}
          >
            <div>
              <p style={{ fontSize: 14, color: "var(--titulo)", fontWeight: 600 }}>{nome}</p>
              <p style={{ fontSize: 12, color: "var(--suave)" }}>
                {dia.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
              </p>
            </div>

            {doDia.length === 0 ? (
              <p style={{ fontSize: 13.5, color: "var(--suave)", alignSelf: "center" }}>—</p>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {doDia.map((p) => (
                  <div key={p.id} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    {p.assets?.[0] && (
                      <img
                        src={p.assets[0].url_publica}
                        alt=""
                        width={44}
                        height={55}
                        style={{ borderRadius: 5, objectFit: "cover", flexShrink: 0 }}
                      />
                    )}
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 14.5, color: "var(--titulo)" }}>{p.titulo_interno}</p>
                      <p style={{ fontSize: 12, marginTop: 3 }}>
                        <span className="mono" style={{ color: COR_STATUS[p.status] }}>
                          {ROTULO_STATUS[p.status]}
                        </span>
                        <span style={{ color: "var(--suave)" }}>
                          {" · "}
                          {quando(p)?.toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </p>
                      {p.status === "erro" && p.erro_detalhe && (
                        <p
                          style={{
                            fontSize: 12.5,
                            color: "var(--erro)",
                            marginTop: 5,
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {p.erro_detalhe}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
