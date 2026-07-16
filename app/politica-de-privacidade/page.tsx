import Link from "next/link";
import { site } from "@/content/site";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";

export const metadata = {
  title: "Política de Privacidade · WM Assessoria",
  description: "Como a WM Assessoria trata os dados pessoais coletados pelo site.",
};

export default function PoliticaDePrivacidade() {
  return (
    <>
      <Header />
      <main className="container section" style={{ maxWidth: 760 }}>
        <span className="eyebrow">LGPD</span>
        <h1 className="display" style={{ fontSize: "clamp(26px,4vw,40px)", margin: "14px 0 32px" }}>
          Política de <span className="g">privacidade</span>
        </h1>

        <div style={{ display: "grid", gap: 20, fontSize: 15.5 }}>
          <p>
            Esta política explica como a <strong style={{ color: "var(--titulo)" }}>{site.empresa.nome}</strong>{" "}
            (CNPJ {site.empresa.cnpj}) trata os dados pessoais coletados neste site, em conformidade
            com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
          </p>

          <h2 style={{ color: "var(--acento)", fontSize: 18, marginTop: 8 }}>Quais dados coletamos</h2>
          <p>
            Coletamos apenas o que você informa voluntariamente na calculadora e nos formulários:
            nome, número de WhatsApp e os dados da sua obra (tipo, área, situação). Também podemos
            registrar a origem da visita (por exemplo, se você chegou por um anúncio).
          </p>

          <h2 style={{ color: "var(--acento)", fontSize: 18, marginTop: 8 }}>Para que usamos</h2>
          <p>
            Exclusivamente para entrar em contato com você sobre a análise da sua obra e apresentar
            nossos serviços. Não vendemos nem compartilhamos seus dados com terceiros para fins de
            marketing.
          </p>

          <h2 style={{ color: "var(--acento)", fontSize: 18, marginTop: 8 }}>Por quanto tempo guardamos</h2>
          <p>
            Mantemos seus dados enquanto durar o relacionamento comercial ou até você pedir a
            exclusão.
          </p>

          <h2 style={{ color: "var(--acento)", fontSize: 18, marginTop: 8 }}>Seus direitos</h2>
          <p>
            Você pode, a qualquer momento, solicitar acesso, correção ou exclusão dos seus dados.
            Basta falar conosco pelo{" "}
            <a href={site.empresa.whatsapp} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>{" "}
            que atendemos seu pedido.
          </p>

          <p style={{ marginTop: 12 }}>
            <Link href="/">← Voltar para o site</Link>
          </p>
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
