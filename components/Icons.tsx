/**
 * Ícones dos serviços — traço 1.8, estilo linear, cor herdada (currentColor).
 * A chave de cada ícone é usada em content/site.ts (campo "icone").
 */
const S = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export const icones: Record<string, React.ReactNode> = {
  // seta para baixo sobre cifrão — redução de INSS
  reducao: (
    <svg viewBox="0 0 24 24" width="26" height="26" {...S} aria-hidden="true">
      <path d="M12 3v10m0 0 4-4m-4 4-4-4" />
      <path d="M5 17c1.5 2.5 4 4 7 4s5.5-1.5 7-4" />
    </svg>
  ),
  // capacete de obra — acompanhamento
  acompanhamento: (
    <svg viewBox="0 0 24 24" width="26" height="26" {...S} aria-hidden="true">
      <path d="M4 16a8 8 0 0 1 16 0" />
      <path d="M10 8.5V6a2 2 0 0 1 4 0v2.5" />
      <path d="M2.5 16h19v2.5h-19z" />
    </svg>
  ),
  // ampulheta — decadência (tempo a favor)
  decadencia: (
    <svg viewBox="0 0 24 24" width="26" height="26" {...S} aria-hidden="true">
      <path d="M6 3h12M6 21h12" />
      <path d="M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9" />
    </svg>
  ),
  // documento com selo de check — CND
  cnd: (
    <svg viewBox="0 0 24 24" width="26" height="26" {...S} aria-hidden="true">
      <path d="M6 3h9l4 4v14H6z" />
      <path d="M15 3v4h4" />
      <path d="m9.5 14 2 2 3.5-3.5" />
    </svg>
  ),
  // balão de conversa — consultoria
  consultoria: (
    <svg viewBox="0 0 24 24" width="26" height="26" {...S} aria-hidden="true">
      <path d="M21 12a8 8 0 0 1-8 8H4l2-3a8 8 0 1 1 15-5z" />
      <path d="M8.5 12h.01M12 12h.01M15.5 12h.01" strokeWidth="2.4" />
    </svg>
  ),
  // lupa sobre planta — análise gratuita
  analise: (
    <svg viewBox="0 0 24 24" width="26" height="26" {...S} aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5" />
      <path d="M8 10.5h5M10.5 8v5" />
    </svg>
  ),
};
