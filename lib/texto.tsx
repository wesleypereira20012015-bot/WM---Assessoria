/**
 * Converte "Texto com *palavra dourada*" em JSX:
 * o trecho entre asteriscos ganha a cor ouro (classe .g).
 */
export function comDestaque(texto: string): React.ReactNode {
  const partes = texto.split(/\*(.+?)\*/g);
  return partes.map((parte, i) =>
    i % 2 === 1 ? (
      <span key={i} className="g">
        {parte}
      </span>
    ) : (
      parte
    )
  );
}
