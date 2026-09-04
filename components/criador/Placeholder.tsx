/**
 * Aba que ainda não existe.
 *
 * A navegação já nasce completa para o menu não mudar de forma depois, mas
 * a página deixa claro que nada foi implementado, em vez de fingir uma tela
 * vazia que parece quebrada.
 */
export default function Placeholder({
  titulo,
  descricao,
  hoje,
}: {
  titulo: string;
  descricao: string;
  hoje: string;
}) {
  return (
    <div
      style={{
        padding: "40px 32px",
        border: "1px dashed var(--linha-forte)",
        borderRadius: "var(--r-card)",
        maxWidth: 560,
      }}
    >
      <p className="mono" style={{ fontSize: 10.5, color: "var(--acento)" }}>
        AINDA NÃO CONSTRUÍDO
      </p>
      <h2 style={{ fontSize: 22, color: "var(--titulo)", margin: "10px 0 12px" }}>{titulo}</h2>
      <p style={{ fontSize: 14.5, lineHeight: 1.7 }}>{descricao}</p>
      <p style={{ fontSize: 13.5, color: "var(--suave)", marginTop: 14 }}>{hoje}</p>
    </div>
  );
}
