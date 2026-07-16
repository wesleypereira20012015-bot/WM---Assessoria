import { site } from "@/content/site";
import { linkWhatsApp } from "@/lib/whatsapp";

/** Botão flutuante do WhatsApp, fixo no canto em todas as páginas. */
export default function WhatsAppFloat() {
  return (
    <a
      href={linkWhatsApp()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Falar com a ${site.empresa.nome} no WhatsApp`}
      style={{
        position: "fixed",
        right: 20,
        bottom: 20,
        zIndex: 60,
        width: 60,
        height: 60,
        borderRadius: "50%",
        background: "var(--whatsapp)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 8px 28px rgba(37, 211, 102, 0.42)",
      }}
    >
      <svg width="30" height="30" viewBox="0 0 24 24" fill="#06331A" aria-hidden="true">
        <path d="M12 2a9.9 9.9 0 0 0-8.51 15.07L2 22l5.09-1.46A9.96 9.96 0 1 0 12 2Zm0 18.13c-1.6 0-3.16-.43-4.52-1.24l-.32-.19-3.02.86.88-2.94-.21-.34a8.14 8.14 0 1 1 7.19 3.85Zm4.46-6.1c-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.24-.63.79-.77.95-.14.16-.28.18-.53.06-.24-.12-1.03-.38-1.96-1.21-.72-.64-1.21-1.44-1.35-1.68-.14-.24-.02-.37.11-.5.11-.11.24-.28.37-.42.12-.14.16-.24.24-.4.08-.16.04-.31-.02-.43-.06-.12-.55-1.32-.75-1.81-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.43.06-.65.31-.22.24-.85.83-.85 2.03s.87 2.36 1 2.52c.12.16 1.72 2.62 4.16 3.68.58.25 1.03.4 1.39.51.58.19 1.11.16 1.53.1.47-.07 1.44-.59 1.64-1.16.2-.57.2-1.05.14-1.16-.06-.1-.22-.16-.46-.28Z" />
      </svg>
    </a>
  );
}
