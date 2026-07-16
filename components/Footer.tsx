import Link from "next/link";
import { site } from "@/content/site";
import { linkWhatsApp } from "@/lib/whatsapp";
import Logo from "./Logo";

/** Rodapé: marca, CNPJ, contatos, aviso legal e política de privacidade. */
export default function Footer() {
  return (
    <footer
      id="contato"
      className="sec-escuro"
      style={{
        background: "var(--marinho-950)",
        color: "var(--texto)",
        borderTop: "1px solid rgba(201, 162, 74, 0.25)",
        padding: "72px 0 100px",
      }}
    >
      <div className="container" style={{ display: "grid", gap: 36 }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 40,
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div style={{ maxWidth: 380 }}>
            <Logo largura={216} />
            <p style={{ marginTop: 18, fontSize: 14 }}>{site.rodape.atendimento}</p>
            <p className="mono" style={{ marginTop: 8, fontSize: 10.5, color: "var(--suave)" }}>
              CNPJ {site.empresa.cnpj}
            </p>
          </div>
          <div>
            <h3
              style={{
                fontFamily: "var(--font-cormorant), serif",
                fontSize: 20,
                fontWeight: 600,
                color: "var(--titulo)",
                marginBottom: 14,
              }}
            >
              Contato
            </h3>
            <ul style={{ listStyle: "none", display: "grid", gap: 10, fontSize: 14.5 }}>
              <li>
                <a href={linkWhatsApp()} target="_blank" rel="noopener noreferrer">
                  WhatsApp — (65) 99972-5622
                </a>
              </li>
              <li>
                <a href={site.empresa.instagram} target="_blank" rel="noopener noreferrer">
                  Instagram — @wesley.inssobras
                </a>
              </li>
            </ul>
          </div>
          <div style={{ maxWidth: 320 }}>
            <h3
              style={{
                fontFamily: "var(--font-cormorant), serif",
                fontSize: 20,
                fontWeight: 600,
                color: "var(--titulo)",
                marginBottom: 14,
              }}
            >
              Especialistas
            </h3>
            <p style={{ fontSize: 14.5 }}>{site.empresa.especialistas}</p>
            <p style={{ marginTop: 10, fontSize: 14.5 }}>
              <Link href="/politica-de-privacidade">Política de privacidade</Link>
            </p>
          </div>
        </div>
        <hr className="hr-ouro" />
        <p style={{ fontSize: 12.5, color: "var(--suave)", maxWidth: 760 }}>
          {site.rodape.avisoLegal}
        </p>
        <p className="mono" style={{ fontSize: 10, color: "var(--suave)" }}>
          © {new Date().getFullYear()} {site.empresa.nome} · Todos os direitos reservados
        </p>
      </div>
    </footer>
  );
}
