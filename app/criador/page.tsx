import { revalidatePath } from "next/cache";
import {
  criarIdeia,
  criadorConfigurado,
  descartarIdeia,
  listarIdeias,
  moverPrioridade,
  type Ideia,
} from "@/lib/criador";

/**
 * Aba Ideias.
 *
 * É a aba mais usada, então o campo de escrever vem primeiro, focado, e
 * manda com Enter. Sem modal, sem etapa intermediária.
 */

async function acaoCriar(formData: FormData) {
  "use server";
  await criarIdeia(String(formData.get("titulo") ?? ""), String(formData.get("descricao") ?? ""));
  revalidatePath("/criador");
}

async function acaoSubir(formData: FormData) {
  "use server";
  await moverPrioridade(String(formData.get("id")), 1);
  revalidatePath("/criador");
}

async function acaoDescer(formData: FormData) {
  "use server";
  await moverPrioridade(String(formData.get("id")), -1);
  revalidatePath("/criador");
}

async function acaoDescartar(formData: FormData) {
  "use server";
  await descartarIdeia(String(formData.get("id")));
  revalidatePath("/criador");
}

const ROTULO_ORIGEM: Record<Ideia["origem"], string> = {
  manual: "sua",
  instagram: "do Instagram",
  noticia: "de notícia",
};

export default async function IdeiasPage() {
  let ideias: Ideia[] = [];
  let falha = "";
  if (criadorConfigurado()) {
    try {
      ideias = await listarIdeias();
    } catch (e) {
      falha = e instanceof Error ? e.message : String(e);
    }
  }

  const naFila = ideias.filter((i) => i.status === "nova");
  const emProducao = ideias.filter((i) => i.status === "em_producao");

  return (
    <>
      <form
        action={acaoCriar}
        style={{
          display: "grid",
          gap: 12,
          padding: "24px",
          border: "1px solid var(--linha-forte)",
          borderRadius: "var(--r-card)",
          background: "var(--card-bg)",
          marginBottom: 36,
        }}
      >
        <div className="field">
          <label htmlFor="titulo" style={{ fontSize: 15 }}>
            O que você quer falar?
          </label>
          <input
            id="titulo"
            name="titulo"
            className="input"
            autoFocus
            autoComplete="off"
            required
            minLength={3}
            maxLength={300}
            placeholder="Ex: muita gente paga INSS de obra duas vezes sem saber"
          />
        </div>
        <div className="field">
          <label htmlFor="descricao" style={{ fontSize: 13, color: "var(--suave)" }}>
            Detalhe, se quiser (opcional)
          </label>
          <textarea
            id="descricao"
            name="descricao"
            className="input"
            rows={2}
            maxLength={4000}
            style={{ resize: "vertical", fontFamily: "inherit" }}
          />
        </div>
        <button type="submit" className="btn btn-ouro" style={{ justifySelf: "start" }}>
          Mandar pra fila
        </button>
      </form>

      {falha && (
        <p style={{ color: "var(--erro)", marginBottom: 24, fontSize: 14 }}>
          Não consegui ler as ideias. {falha}
        </p>
      )}

      <Secao titulo="Na fila" ideias={naFila} vazio="Nenhuma ideia esperando. Escreva a primeira aí em cima." />
      {emProducao.length > 0 && <Secao titulo="Em produção" ideias={emProducao} vazio="" />}
    </>
  );
}

function Secao({ titulo, ideias, vazio }: { titulo: string; ideias: Ideia[]; vazio: string }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 className="mono" style={{ fontSize: 11, color: "var(--acento)", marginBottom: 14 }}>
        {titulo.toUpperCase()} ({ideias.length})
      </h2>

      {ideias.length === 0 ? (
        vazio && <p style={{ fontSize: 14.5, color: "var(--suave)" }}>{vazio}</p>
      ) : (
        <ul style={{ listStyle: "none", display: "grid", gap: 10 }}>
          {ideias.map((ideia) => (
            <li
              key={ideia.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
                padding: "16px 18px",
                border: "1px solid var(--linha)",
                borderRadius: 12,
                background: "var(--card-bg)",
              }}
            >
              <span
                className="mono"
                style={{ fontSize: 12, color: "var(--acento)", minWidth: 28, paddingTop: 3 }}
                title="Prioridade"
              >
                {ideia.prioridade}
              </span>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: "var(--titulo)", fontWeight: 600, fontSize: 15.5 }}>
                  {ideia.titulo}
                </p>
                {ideia.descricao && (
                  <p style={{ fontSize: 14, marginTop: 4, whiteSpace: "pre-wrap" }}>
                    {ideia.descricao}
                  </p>
                )}
                <p style={{ fontSize: 12, color: "var(--suave)", marginTop: 6 }}>
                  {new Date(ideia.criado_em).toLocaleDateString("pt-BR")} · ideia{" "}
                  {ROTULO_ORIGEM[ideia.origem]}
                </p>
              </div>

              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <BotaoIcone acao={acaoSubir} id={ideia.id} titulo="Subir na fila" simbolo="↑" />
                <BotaoIcone acao={acaoDescer} id={ideia.id} titulo="Descer na fila" simbolo="↓" />
                <BotaoIcone
                  acao={acaoDescartar}
                  id={ideia.id}
                  titulo="Descartar"
                  simbolo="×"
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function BotaoIcone({
  acao,
  id,
  titulo,
  simbolo,
}: {
  acao: (formData: FormData) => Promise<void>;
  id: string;
  titulo: string;
  simbolo: string;
}) {
  return (
    <form action={acao}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        title={titulo}
        aria-label={titulo}
        className="btn btn-ghost btn-compacto"
        style={{ minWidth: 36, padding: "6px 10px", lineHeight: 1 }}
      >
        {simbolo}
      </button>
    </form>
  );
}
