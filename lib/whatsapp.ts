import { site } from "@/content/site";

/** Monta o link do WhatsApp com mensagem pré-preenchida. */
export function linkWhatsApp(mensagem?: string): string {
  const texto = mensagem ?? site.empresa.whatsappMensagem;
  return `${site.empresa.whatsapp}?text=${encodeURIComponent(texto)}`;
}
