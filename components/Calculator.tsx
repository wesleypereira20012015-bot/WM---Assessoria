"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { site } from "@/content/site";
import { vaus, destinacoes, categorias, materiais, regimes } from "@/content/tabelas-sero";
import {
  brl,
  calcularINSS,
  type CategoriaId,
  type DadosObra,
  type DestinacaoId,
  type MaterialId,
  type RegimeId,
  type ResultadoCalculo,
} from "@/lib/calc";
import { linkWhatsApp } from "@/lib/whatsapp";
import { enviarLead, mascaraWhatsApp, whatsappValido } from "@/lib/lead-client";
import Button from "./ui/Button";
import { Input, Select } from "./ui/Input";

type Passo = "dados" | "lead" | "resultado";

const regimesPJ = regimes.filter((r) => r.id !== "pf");

/**
 * Calculadora de INSS de obras — principal capturadora de leads.
 * Mesmos campos e mesmas tabelas da calculadora oficial da WM.
 * Passo 1: dados da obra → Passo 2: prévia + nome/WhatsApp → Passo 3: resultado completo.
 */
export default function Calculator() {
  const [passo, setPasso] = useState<Passo>("dados");

  // Passo 1 — dados da obra
  const [uf, setUf] = useState(site.calculadora.parametros.ufPadrao);
  const [destinacao, setDestinacao] = useState<DestinacaoId>("residUnifamiliar");
  const [categoria, setCategoria] = useState<CategoriaId>("obraNova");
  const [material, setMaterial] = useState<MaterialId>("alvenaria");
  const [area, setArea] = useState("");
  const [tipoPessoa, setTipoPessoa] = useState<"pf" | "pj">("pf");
  const [regimePJ, setRegimePJ] = useState<RegimeId>("simples");
  const [concreto, setConcreto] = useState<"nao" | "sim">("nao");
  const [antiga, setAntiga] = useState<"nao" | "sim">("nao");
  const [erroArea, setErroArea] = useState("");

  // Passo 2 — lead
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [consent, setConsent] = useState(false);
  const [erros, setErros] = useState<{ nome?: string; whatsapp?: string; consent?: string }>({});
  const [enviando, setEnviando] = useState(false);

  const [resultado, setResultado] = useState<ResultadoCalculo | null>(null);

  function dadosObra(): DadosObra {
    return {
      uf,
      destinacao,
      categoria,
      material,
      area: Number(area.replace(/\./g, "").replace(",", ".")),
      regime: tipoPessoa === "pf" ? "pf" : regimePJ,
      concretoUsinado: concreto === "sim",
      concluidaHaMaisDe5Anos: antiga === "sim",
    };
  }

  function calcular(e: React.FormEvent) {
    e.preventDefault();
    const m2 = Number(area.replace(/\./g, "").replace(",", "."));
    if (!m2 || m2 < 10 || m2 > 100000) {
      setErroArea("Informe a área construída em m² (mínimo 10).");
      return;
    }
    setErroArea("");
    setResultado(calcularINSS(dadosObra()));
    setPasso("lead");
  }

  async function liberar(e: React.FormEvent) {
    e.preventDefault();
    const novos: typeof erros = {};
    if (nome.trim().length < 2) novos.nome = "Informe seu nome.";
    if (!whatsappValido(whatsapp)) novos.whatsapp = "Informe um WhatsApp válido com DDD.";
    if (!consent) novos.consent = "É preciso autorizar o contato.";
    setErros(novos);
    if (Object.keys(novos).length || !resultado) return;

    const nomeDest = destinacoes.find((d) => d.id === destinacao)?.nome;
    setEnviando(true);
    await enviarLead({
      nome: nome.trim(),
      whatsapp,
      consentimento: consent,
      dados_obra: {
        estado: uf,
        destinacao: nomeDest,
        categoria: categorias.find((c) => c.id === categoria)?.nome,
        material: materiais.find((m) => m.id === material)?.nome,
        area_m2: dadosObra().area,
        responsavel: tipoPessoa === "pf" ? "Pessoa física" : regimes.find((r) => r.id === regimePJ)?.nome,
        concreto_usinado: concreto === "sim",
        concluida_ha_mais_de_5_anos: antiga === "sim",
      },
      resultado: {
        custo_obra: Math.round(resultado.custoObra),
        inss_estimado: Math.round(resultado.inssEstimado),
        economia_min: Math.round(resultado.economiaMin),
        economia_max: Math.round(resultado.economiaMax),
        possivel_decadencia: resultado.possivelDecadencia,
      },
    });
    setEnviando(false);
    setPasso("resultado"); // mesmo se a API falhar, o lead não perde o resultado
  }

  const mensagemWhats = resultado
    ? `Olá! Simulei minha obra no site: ${destinacoes.find((d) => d.id === destinacao)?.nome}, ${area} m², ${uf.slice(0, 2)}. INSS estimado de ${brl(resultado.inssEstimado, true)}. Quero a análise gratuita para confirmar quanto posso economizar. Meu nome é ${nome}.`
    : undefined;

  const anim = {
    initial: { opacity: 0, x: 32 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -32 },
    transition: { duration: 0.35 },
  };

  return (
    <div
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--card-borda)",
        borderTop: "2px solid var(--acento)",
        borderRadius: "var(--r-bloco)",
        padding: "clamp(24px, 4.5vw, 48px)",
        boxShadow: "var(--sombra-card)",
        maxWidth: 760,
        margin: "0 auto",
        overflow: "hidden",
      }}
    >
      {/* Indicador de passos */}
      <ol
        className="mono"
        aria-label="Etapas da simulação"
        style={{
          display: "flex",
          gap: 8,
          listStyle: "none",
          fontSize: 10.5,
          marginBottom: 28,
          flexWrap: "wrap",
        }}
      >
        {(["dados", "lead", "resultado"] as Passo[]).map((p, i) => {
          const ativo = passo === p;
          const feito = ["dados", "lead", "resultado"].indexOf(passo) > i;
          return (
            <li
              key={p}
              aria-current={ativo ? "step" : undefined}
              style={{
                padding: "6px 14px",
                borderRadius: 999,
                border: `1px solid ${ativo || feito ? "var(--linha-forte)" : "var(--card-borda)"}`,
                color: ativo ? "var(--acento)" : feito ? "var(--ok)" : "var(--suave)",
              }}
            >
              {i + 1}. {p === "dados" ? "Sua obra" : p === "lead" ? "Seus dados" : "Resultado"}
              {feito ? " ✓" : ""}
            </li>
          );
        })}
      </ol>

      <AnimatePresence mode="wait" initial={false}>
        {passo === "dados" && (
          <motion.form key="dados" onSubmit={calcular} noValidate style={{ display: "grid", gap: 18 }} {...anim}>
            <div className="grid-2">
              <Select label="Estado da obra" id="calc-uf" value={uf} onChange={(e) => setUf(e.target.value)}>
                {vaus.map((v) => (
                  <option key={v.uf} value={v.uf}>
                    {v.uf}
                  </option>
                ))}
              </Select>
              <Select
                label="Categoria"
                id="calc-categoria"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as CategoriaId)}
              >
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid-2">
              <Select
                label="Destinação da obra"
                id="calc-destinacao"
                value={destinacao}
                onChange={(e) => setDestinacao(e.target.value as DestinacaoId)}
              >
                {destinacoes.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nome}
                  </option>
                ))}
              </Select>
              <Select
                label="Tipo de construção"
                id="calc-material"
                value={material}
                onChange={(e) => setMaterial(e.target.value as MaterialId)}
              >
                {materiais.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid-2">
              <Input
                label="Área construída"
                id="calc-area"
                placeholder="Ex.: 180"
                inputMode="decimal"
                prefixo="m²"
                value={area}
                onChange={(e) => setArea(e.target.value.replace(/[^\d.,]/g, ""))}
                erro={erroArea}
              />
              <Select
                label="Quem é o responsável?"
                id="calc-pessoa"
                value={tipoPessoa}
                onChange={(e) => setTipoPessoa(e.target.value as "pf" | "pj")}
              >
                <option value="pf">Pessoa física</option>
                <option value="pj">Empresa (PJ)</option>
              </Select>
            </div>
            {tipoPessoa === "pj" && (
              <Select
                label="Regime tributário da empresa"
                id="calc-regime"
                value={regimePJ}
                onChange={(e) => setRegimePJ(e.target.value as RegimeId)}
              >
                {regimesPJ.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nome}
                  </option>
                ))}
              </Select>
            )}
            <div className="grid-2">
              <Select
                label="Usou concreto usinado?"
                id="calc-concreto"
                value={concreto}
                onChange={(e) => setConcreto(e.target.value as "sim" | "nao")}
              >
                <option value="nao">Não / não sei</option>
                <option value="sim">Sim</option>
              </Select>
              <Select
                label="Obra concluída há mais de 5 anos?"
                id="calc-antiga"
                value={antiga}
                onChange={(e) => setAntiga(e.target.value as "sim" | "nao")}
              >
                <option value="nao">Não (em andamento ou recente)</option>
                <option value="sim">Sim, há mais de 5 anos</option>
              </Select>
            </div>
            <div style={{ marginTop: 6 }}>
              <Button variante="ouro" type="submit" className="btn-largo">
                Calcular meu INSS
              </Button>
            </div>
          </motion.form>
        )}

        {passo === "lead" && resultado && (
          <motion.div key="lead" {...anim}>
            {/* Prévia parcial — gera curiosidade antes da captura */}
            <div
              style={{
                border: "1px solid var(--card-borda)",
                borderRadius: "var(--r-card)",
                padding: "20px 24px",
                marginBottom: 24,
                background: "var(--bg)",
              }}
            >
              <span className="mono" style={{ fontSize: 10.5, color: "var(--suave)" }}>
                Custo da obra aferido (base SERO)
              </span>
              <p
                style={{
                  fontFamily: "var(--font-cormorant), serif",
                  fontSize: 38,
                  fontWeight: 600,
                  color: "var(--titulo)",
                  lineHeight: 1.1,
                }}
              >
                {brl(resultado.custoObra, true)}
              </p>
              <p style={{ fontSize: 14, marginTop: 8 }}>
                Sobre esse custo, a Receita calcula o INSS devido — e a diferença entre pagar o
                valor cheio ou o valor <strong style={{ color: "var(--acento)" }}>com a estratégia certa</strong>{" "}
                pode chegar à casa dos milhares de reais.
              </p>
            </div>
            <p style={{ fontWeight: 600, color: "var(--titulo)", marginBottom: 16 }}>
              Deixe seu nome e WhatsApp para ver o resultado completo — e receber a análise
              gratuita de um especialista:
            </p>
            <form onSubmit={liberar} noValidate style={{ display: "grid", gap: 16 }}>
              <div className="grid-2">
                <Input
                  label="Seu nome"
                  id="calc-nome"
                  placeholder="Como podemos te chamar?"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  erro={erros.nome}
                  autoComplete="name"
                />
                <Input
                  label="Seu WhatsApp"
                  id="calc-whats"
                  placeholder="(00) 00000-0000"
                  inputMode="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(mascaraWhatsApp(e.target.value))}
                  erro={erros.whatsapp}
                  autoComplete="tel"
                />
              </div>
              <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13, cursor: "pointer" }}>
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
                    <span style={{ display: "block", color: "var(--erro)", fontSize: 12.5 }}>{erros.consent}</span>
                  )}
                </span>
              </label>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Button variante="ouro" type="submit" disabled={enviando}>
                  {enviando ? "Liberando…" : "Ver resultado completo"}
                </Button>
                <Button variante="ghost" onClick={() => setPasso("dados")}>
                  Voltar
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        {passo === "resultado" && resultado && (
          <motion.div key="resultado" {...anim} style={{ display: "grid", gap: 20 }}>
            <div className="grid-2">
              <div
                style={{
                  border: "1px solid var(--card-borda)",
                  borderRadius: "var(--r-card)",
                  padding: "20px 24px",
                  background: "var(--bg)",
                }}
              >
                <span className="mono" style={{ fontSize: 10.5, color: "var(--suave)" }}>
                  INSS estimado da sua obra
                </span>
                <p
                  style={{
                    fontFamily: "var(--font-cormorant), serif",
                    fontSize: 40,
                    fontWeight: 600,
                    color: "var(--atencao)",
                    lineHeight: 1.1,
                  }}
                >
                  {brl(resultado.inssEstimado, true)}
                </p>
                <p style={{ fontSize: 12.5, marginTop: 6 }}>
                  pela aferição da Receita ({(resultado.aliquota * 100).toLocaleString("pt-BR")}% sobre a mão de obra)
                </p>
              </div>
              <div
                style={{
                  border: "1px solid rgba(37,122,82,.35)",
                  borderRadius: "var(--r-card)",
                  padding: "20px 24px",
                  background: "var(--bg)",
                }}
              >
                <span className="mono" style={{ fontSize: 10.5, color: "var(--suave)" }}>
                  Economia potencial com a WM
                </span>
                <p
                  style={{
                    fontFamily: "var(--font-cormorant), serif",
                    fontSize: 40,
                    fontWeight: 600,
                    color: "var(--ok)",
                    lineHeight: 1.1,
                  }}
                >
                  {brl(resultado.economiaMin, true)} – {brl(resultado.economiaMax, true)}
                </p>
                <p style={{ fontSize: 12.5, marginTop: 6 }}>
                  faixa estimada, conforme a documentação e o histórico da obra
                </p>
              </div>
            </div>

            {resultado.creditoConcreto > 0 && (
              <p style={{ fontSize: 13.5 }}>
                Já descontamos {brl(resultado.creditoConcreto, true)} de crédito do concreto usinado.
              </p>
            )}

            {resultado.possivelDecadencia && (
              <div
                style={{
                  border: "1px solid rgba(37,122,82,.35)",
                  borderRadius: "var(--r-card)",
                  padding: "16px 20px",
                  background: "rgba(37,122,82,.06)",
                  fontSize: 14.5,
                }}
              >
                <strong style={{ color: "var(--ok)" }}>Boa notícia:</strong> obras concluídas
                há mais de {site.calculadora.parametros.anosDecadencia} anos podem ter o débito{" "}
                <strong style={{ color: "var(--ok)" }}>extinto por decadência</strong> — em
                muitos casos a CND sai sem pagar nada. Seu caso merece análise imediata.
              </div>
            )}

            <p style={{ fontSize: 12.5, color: "var(--suave)", fontStyle: "italic" }}>{site.calculadora.disclaimer}</p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Button variante="whatsapp" href={linkWhatsApp(mensagemWhats)}>
                Falar agora no WhatsApp
              </Button>
              <Button
                variante="ghost"
                onClick={() => {
                  setPasso("dados");
                  setResultado(null);
                }}
              >
                Simular outra obra
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
