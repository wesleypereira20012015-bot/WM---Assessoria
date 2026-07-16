/** Chip de prova (pill). Use ok para a variante verde ("CND emitida"). */
export default function Chip({
  children,
  ok = false,
}: {
  children: React.ReactNode;
  ok?: boolean;
}) {
  return <span className={`chip ${ok ? "ok" : ""}`}>{children}</span>;
}
