/**
 * Tratamento de texto da arte.
 *
 * Roda igual em Deno (Edge Function) e em Node (teste local): é tudo string,
 * sem nenhuma API de runtime.
 */

/**
 * Tira travessão de qualquer texto que vá para a arte.
 *
 * A regra da marca é não usar travessão. Em vez de confiar em quem escreveu
 * o texto, a arte remove na entrada: travessão vira vírgula, e travessão
 * entre números (que quase sempre é intervalo) vira hífen.
 */
export function semTravessao(texto: string): string {
  return texto
    // Intervalo numérico: "10 – 20" vira "10-20".
    .replace(/(\d)\s*[–—]\s*(\d)/g, "$1-$2")
    // Travessão separando oração vira vírgula.
    .replace(/\s*[–—]\s*/g, ", ")
    // A troca acima pode gerar ", ," ou vírgula colada em pontuação.
    .replace(/,\s*,/g, ",")
    .replace(/\s+,/g, ",")
    .replace(/,\s*([.;:!?])/g, "$1")
    .replace(/,\s*$/, "");
}

/** Normaliza espaços e quebras de linha, e tira travessão. */
export function limpar(texto: string): string {
  return semTravessao(String(texto ?? ""))
    .replace(/\s+/g, " ")
    .trim();
}

/** Escapa o que não pode entrar cru em XML/SVG. */
export function escaparXml(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** True se sobrou algum travessão. Usado pelos testes como rede de segurança. */
export function temTravessao(texto: string): boolean {
  return /[–—]/.test(texto);
}
