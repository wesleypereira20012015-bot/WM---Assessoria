import { revalidatePath } from "next/cache";
import Carrossel from "@/components/criador/Carrossel";
import {
  aprovarEAgendar,
  criadorConfigurado,
  lerHashtags,
  listarAguardandoAprovacao,
  reprovar,
  salvarLegenda,
  type Publicacao,
} from "@/lib/criador";

/**
 * Aba Aprovação.
 *
 * Nada é publicado sem passar por aqui. Aprovar e agendar acontecem na
 * mesma escrita, e o próprio banco recusa uma publicação agendada sem
 * carimbo de aprovação.
 */

async function acaoAprovar(formData: FormData) {
  "use server";
  await aprovarEAgendar(String(formData.get("id")), new Date(String(formData.get("quando"))));
  revalidatePath("/criador/aprovacao");
  revalidatePath("/criador/calendario");
}

async function acaoReprovar(formData: FormData) {
  "use server";
  await reprovar(String(formData.get("id")), String(formData.get("motivo") ?? ""));
  revalidatePath("/criador/aprovacao");
}

async function acaoSalvarLegenda(formData: FormData) {
  "use server";
  await salvarLegenda(
    String(formData.get("id")),
    String(formData.get("legenda") ?? ""),
    lerHashtags(String(formData.get("hashtags") ?? "")),
  );
  revalidatePath("/criador/aprovacao");
}

/** Sugere o próximo horário cheio, para o campo de data já vir preenchido. */
function proximoHorario(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(19, 0, 0, 0);
  // datetime-local quer horário local sem fuso, no formato YYYY-MM-DDTHH:mm
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default async function AprovacaoPage() {
  let publicacoes: Publicacao[] = [];
  let falha = "";
  if (criadorConfigurado()) {
    try {
      publicacoes = await listarAguardandoAprovacao();
    } catch (e) {
      falha = e instanceof Error ? e.message : String(e);
    }
  }

  if (falha) {
    return <p style={{ color: "var(--erro)", fontSize: 14 }}>Não consegui ler as publicações. {falha}</p>;
  }

  if (publicacoes.length === 0) {
    return (
      <p style={{ fontSize: 14.5, color: "var(--suave)" }}>
        Nada esperando aprovação. Quando a pauta da semana rodar, as publicações aparecem aqui com a
        arte pronta.
      </p>
    );
  }

  return (
    <div style={{ display: "grid", gap: 48 }}>
      {publicacoes.map((p) => (
        <article
          key={p.id}
          style={{
            display: "grid",
            gap: 28,
            gridTemplateColumns: "minmax(280px, 380px) 1fr",
            alignItems: "start",
            padding: 24,
            border: "1px solid var(--linha)",
            borderRadius: "var(--r-card)",
            background: "var(--card-bg)",
          }}
        >
          <div>
            <Carrossel assets={p.assets ?? []} />
          </div>

          <div style={{ display: "grid", gap: 20, minWidth: 0 }}>
            <div>
              <p className="mono" style={{ fontSize: 10.5, color: "var(--acento)" }}>
                {p.formato.toUpperCase()} · {p.cards?.length ?? 0} PRANCHAS
              </p>
              <h2 style={{ fontSize: 19, color: "var(--titulo)", marginTop: 6 }}>
                {p.titulo_interno}
              </h2>
            </div>

            {/* Editar a legenda antes de aprovar. Salva direto no banco. */}
            <form action={acaoSalvarLegenda} style={{ display: "grid", gap: 10 }}>
              <input type="hidden" name="id" value={p.id} />
              <div className="field">
                <label htmlFor={`legenda-${p.id}`} style={{ fontSize: 13 }}>
                  Legenda
                </label>
                <textarea
                  id={`legenda-${p.id}`}
                  name="legenda"
                  className="input"
                  rows={7}
                  maxLength={2200}
                  defaultValue={p.legenda ?? ""}
                  style={{ resize: "vertical", fontFamily: "inherit", lineHeight: 1.6 }}
                />
              </div>
              <div className="field">
                <label htmlFor={`hashtags-${p.id}`} style={{ fontSize: 13 }}>
                  Hashtags
                </label>
                <input
                  id={`hashtags-${p.id}`}
                  name="hashtags"
                  className="input"
                  defaultValue={(p.hashtags ?? []).join(" ")}
                />
              </div>
              <button type="submit" className="btn btn-ghost btn-compacto" style={{ justifySelf: "start" }}>
                Salvar legenda
              </button>
            </form>

            <div
              style={{
                display: "grid",
                gap: 16,
                paddingTop: 20,
                borderTop: "1px solid var(--linha)",
              }}
            >
              <form
                action={acaoAprovar}
                style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}
              >
                <input type="hidden" name="id" value={p.id} />
                <div className="field" style={{ flex: "1 1 220px" }}>
                  <label htmlFor={`quando-${p.id}`} style={{ fontSize: 13 }}>
                    Publicar em
                  </label>
                  <input
                    id={`quando-${p.id}`}
                    name="quando"
                    type="datetime-local"
                    className="input"
                    required
                    defaultValue={proximoHorario()}
                  />
                </div>
                <button type="submit" className="btn btn-ouro">
                  Aprovar e agendar
                </button>
              </form>

              <form
                action={acaoReprovar}
                style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}
              >
                <input type="hidden" name="id" value={p.id} />
                <div className="field" style={{ flex: "1 1 220px" }}>
                  <label htmlFor={`motivo-${p.id}`} style={{ fontSize: 13 }}>
                    Reprovar porque
                  </label>
                  <input
                    id={`motivo-${p.id}`}
                    name="motivo"
                    className="input"
                    required
                    minLength={3}
                    placeholder="o que ficou errado"
                  />
                </div>
                <button type="submit" className="btn btn-ghost">
                  Reprovar
                </button>
              </form>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
