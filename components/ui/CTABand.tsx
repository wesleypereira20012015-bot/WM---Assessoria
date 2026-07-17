"use client";

import { useState } from "react";
import Link from "next/link";
import { site } from "@/content/site";
import { comDestaque } from "@/lib/texto";
import { linkWhatsApp } from "@/lib/whatsapp";
import { enviarLead, mascaraWhatsApp, whatsappValido } from "@/lib/lead-client";
import Button from "./Button";
import { Input, Textarea } from "./Input";
import Reveal from "./Reveal";

/** Faixa CTA final: promessa + formulário (nome, WhatsApp, e-mail e situação da obra). */
export default function CTABand() {
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [situacao, setSituacao] = useState("");
  const [consent, setConsent] = useState(false);
  const [erros, setErros] = useState<{ nome?: string; whatsapp?: string; email?: string; consent?: string }>({});
  const [estado, setEstado] = useState<"inicio" | "enviando" | "ok" | "falha">("inicio");

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const novos: typeof erros = {};
    if (nome.trim().length < 2) novos.nome = "Informe seu nome.";
    if (!whatsappValido(whatsapp)) novos.whatsapp = "Informe um WhatsApp válido com DDD.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) novos.email = "Informe um e-mail válido.";
    if (!consent) novos.consent = "É preciso autorizar o contato.";
    setErros(novos);
    if (Object.keys(novos).length) return;

    setEstado("enviando");
    const ok = await enviarLead({
      nome: nome.trim(),
      whatsapp,
      email: email.trim(),
      situacao_obra: situacao.trim() || undefined,
      consentimento: consent,
      dados_obra: { origem_formulario: "cta-final" },
    });
    setEstado(ok ? "ok" : "falha");
  }

  return (
    <section className="section sec-claro" id="analise-gratuita" aria-label="Análise gratuita">
      <div className="container">
        <Reveal>
          <div
            className="sec-escuro"
            style={{
              background: "linear-gradient(180deg, var(--marinho-800), var(--marinho-900))",
              border: "1px solid rgba(201,162,74,.3)",
              borderRadius: "var(--r-bloco)",
              padding: "clamp(36px, 6vw, 72px)",
              textAlign: "center",
              boxShadow: "0 24px 60px rgba(15,31,54,.18)",
            }}
          >
            <h2 className="display" style={{ fontSize: "clamp(30px,3.8vw,46px)" }}>
              {comDestaque(site.ctaFinal.titulo)}
            </h2>
            <p style={{ maxWidth: 560, margin: "16px auto 36px", fontSize: 16.5 }}>
              {site.ctaFinal.subtitulo}
            </p>

            {estado === "ok" ? (
              <div style={{ display: "grid", gap: 18, justifyItems: "center" }}>
                <p style={{ color: "var(--ok)", fontWeight: 600, fontSize: 17 }}>
                  Recebemos seus dados! Um especialista vai falar com você em breve.
                </p>
                <Button
                  variante="whatsapp"
                  href={linkWhatsApp(`Olá! Sou ${nome} e acabei de pedir uma análise gratuita pelo site.`)}
                >
                  Falar agora no WhatsApp
                </Button>
              </div>
            ) : (
              <form
                onSubmit={enviar}
                noValidate
                style={{
                  display: "grid",
                  gap: 16,
                  maxWidth: 640,
                  margin: "0 auto",
                  textAlign: "left",
                }}
              >
                <div className="grid-2">
                  <Input
                    label="Seu nome"
                    id="cta-nome"
                    placeholder="Como podemos te chamar?"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    erro={erros.nome}
                    autoComplete="name"
                  />
                  <Input
                    label="Seu WhatsApp"
                    id="cta-whats"
                    placeholder="(00) 00000-0000"
                    inputMode="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(mascaraWhatsApp(e.target.value))}
                    erro={erros.whatsapp}
                    autoComplete="tel"
                  />
                </div>
                <Input
                  label={site.ctaFinal.labelEmail}
                  id="cta-email"
                  type="email"
                  inputMode="email"
                  placeholder={site.ctaFinal.placeholderEmail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  erro={erros.email}
                  autoComplete="email"
                />
                <Textarea
                  label={site.ctaFinal.labelSituacao}
                  id="cta-situacao"
                  placeholder={site.ctaFinal.placeholderSituacao}
                  value={situacao}
                  onChange={(e) => setSituacao(e.target.value)}
                  rows={4}
                />
                <label
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    style={{ marginTop: 3, accentColor: "var(--ouro-500)", width: 16, height: 16 }}
                  />
                  <span>
                    {site.calculadora.lgpd}{" "}
                    <Link href="/politica-de-privacidade" style={{ textDecoration: "underline" }}>
                      Política de privacidade
                    </Link>
                    {erros.consent && (
                      <span className="msg-erro" style={{ display: "block", color: "var(--erro)" }}>
                        {erros.consent}
                      </span>
                    )}
                  </span>
                </label>
                <div style={{ textAlign: "center", marginTop: 8 }}>
                  <Button variante="ouro" type="submit" disabled={estado === "enviando"}>
                    {estado === "enviando" ? "Enviando…" : site.ctaFinal.botao}
                  </Button>
                  {estado === "falha" && (
                    <p style={{ color: "var(--erro)", fontSize: 13.5, marginTop: 12 }}>
                      Não foi possível enviar. Tente de novo ou chame direto no WhatsApp (botão no
                      canto da tela).
                    </p>
                  )}
                </div>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
