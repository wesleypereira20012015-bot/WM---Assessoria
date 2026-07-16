/**
 * Logo oficial da WM Assessoria (versão horizontal, em SVG).
 * Reproduz fielmente o arquivo de marca "wm-logo-download".
 *
 * fundo="escuro" → letras creme (para seções marinho)
 * fundo="claro"  → letras marinho (para seções creme), como na
 *                  variante "horizontal-marinho" do arquivo da marca.
 */
export default function Logo({
  largura = 216,
  fundo = "escuro",
}: {
  largura?: number;
  fundo?: "escuro" | "claro";
}) {
  const claro = fundo === "claro";
  const palavra = claro ? "#0A1729" : "#F3EFE8";
  const tag = claro ? "#7A6320" : "#C9A24A";
  const linha = claro ? "#A9822F" : "#C9A24A";
  const idGrad = claro ? "wm-au-claro" : "wm-au-escuro";

  return (
    <svg
      viewBox="0 0 680 190"
      width={largura}
      height={(largura * 190) / 680}
      role="img"
      aria-label="WM Assessoria — Redução de INSS de Obras"
    >
      <defs>
        <linearGradient id={idGrad} x1="0" y1="0" x2="0.15" y2="1">
          <stop offset="0" stopColor="#F6E7AE" />
          <stop offset="0.34" stopColor="#DBB863" />
          <stop offset="0.62" stopColor="#C9A24A" />
          <stop offset="1" stopColor="#97701C" />
        </linearGradient>
      </defs>
      <g transform="translate(36,26) scale(1.15)" fill="none" stroke={`url(#${idGrad})`} strokeLinejoin="round">
        <path d="M42 28L42 92M78 28L78 92M36 28L48 28M72 28L84 28M36 92L48 92M72 92L84 92" strokeWidth="4.5" />
        <path d="M42 28L60 60L78 28M42 92L60 60L78 92" strokeWidth="3" />
      </g>
      <line x1="178" y1="52" x2="178" y2="138" stroke={linha} strokeWidth="1.3" opacity="0.55" />
      <text
        x="202"
        y="94"
        fontFamily="var(--font-cormorant), serif"
        fontWeight="600"
        letterSpacing="5"
        fontSize="40"
        fill={palavra}
      >
        WM ASSESSORIA
      </text>
      <line x1="204" y1="110" x2="512" y2="110" stroke={linha} strokeWidth="1" opacity="0.6" />
      <text
        x="204"
        y="130"
        fontFamily="var(--font-inter), sans-serif"
        fontWeight="400"
        letterSpacing="3"
        fontSize="10"
        fill={tag}
      >
        REDUÇÃO DE INSS DE OBRAS
      </text>
    </svg>
  );
}
