import { site } from "@/content/site";
import {
  vaus,
  destinacoes,
  categorias,
  materiais,
  fatoresSociais,
  regimes,
  moConjHabPopular,
  type VauUF,
} from "@/content/tabelas-sero";

/**
 * Cálculo do INSS de obras — RÉPLICA EXATA da calculadora oficial
 * da WM (Simulador de INSS de Obras), que segue a aferição indireta
 * do SERO (IN RFB nº 2.021/2021):
 *
 *  custo da obra = área × % da destinação × VAU do estado
 *  mão de obra   = custo × fator social (só PF, pela área total)
 *                        × fator da categoria (nova/reforma/demolição)
 *                        × % de mão de obra do material
 *                        (edifício de garagens: × 0,8)
 *  crédito       = 5% do custo do concreto usinado (se houver)
 *  INSS          = (mão de obra − crédito) × alíquota do regime
 *                  (PF 36,8% · Simples 31% · desonerado 21,8%/16% ...)
 */

export type DestinacaoId = (typeof destinacoes)[number]["id"];
export type CategoriaId = (typeof categorias)[number]["id"];
export type MaterialId = (typeof materiais)[number]["id"];
export type RegimeId = (typeof regimes)[number]["id"];

export interface DadosObra {
  uf: string; // ex.: "MT - Mato Grosso"
  destinacao: DestinacaoId;
  categoria: CategoriaId;
  material: MaterialId;
  area: number; // m²
  regime: RegimeId; // "pf" ou um dos regimes PJ
  concretoUsinado: boolean;
  concluidaHaMaisDe5Anos: boolean;
}

export interface ResultadoCalculo {
  custoObra: number;
  maoDeObra: number;
  creditoConcreto: number;
  inssEstimado: number;
  aliquota: number;
  economiaMin: number;
  economiaMax: number;
  possivelDecadencia: boolean;
}

type ColunaVau = Exclude<keyof VauUF, "uf" | "cu">;

export function calcularINSS(dados: DadosObra): ResultadoCalculo {
  const tabelaUF = vaus.find((v) => v.uf === dados.uf) ?? vaus[0];
  const dest = destinacoes.find((d) => d.id === dados.destinacao) ?? destinacoes[0];
  const categoria = categorias.find((c) => c.id === dados.categoria) ?? categorias[0];
  const material = materiais.find((m) => m.id === dados.material) ?? materiais[0];
  const regime = regimes.find((r) => r.id === dados.regime) ?? regimes[0];

  // % da destinação (acima do limite de área usa o percentual reduzido)
  let percDestinacao: number = dest.percentual;
  if (dest.limiteM2 && dest.percentualAcimaLimite && dados.area > dest.limiteM2) {
    percDestinacao = dest.percentualAcimaLimite;
  }

  const vau = tabelaUF[dest.id as ColunaVau];
  const custoObra = dados.area * percDestinacao * vau;

  // Fator social: só pessoa física, pela área total
  const pessoaFisica = dados.regime === "pf";
  const fatorSocial = pessoaFisica
    ? (fatoresSociais.find((f) => dados.area <= f.ateM2) ?? fatoresSociais[4]).fator
    : 1;

  // % de mão de obra (conjunto habitacional popular tem tabela própria)
  const percMO =
    dest.id === "conjHabPopular" ? moConjHabPopular[material.id] : material.percentualMO;

  let maoDeObra = custoObra * fatorSocial * categoria.fator * percMO;
  if (dest.id === "garagens") maoDeObra *= 0.8;

  // Crédito do concreto usinado: 5% do custo estimado do concreto
  let creditoConcreto = 0;
  if (dados.concretoUsinado) {
    const percConcreto = tabelaUF.cu[dest.id as keyof VauUF["cu"]] / 100;
    creditoConcreto = custoObra * percConcreto * 0.05;
  }

  const rmt = maoDeObra - creditoConcreto;
  const inssEstimado = Math.max(rmt * regime.aliquota, 0);

  const p = site.calculadora.parametros;
  return {
    custoObra,
    maoDeObra: rmt,
    creditoConcreto,
    inssEstimado,
    aliquota: regime.aliquota,
    economiaMin: inssEstimado * p.economiaMinima,
    economiaMax: inssEstimado * p.economiaMaxima,
    possivelDecadencia: dados.concluidaHaMaisDe5Anos,
  };
}

/** Formata número como moeda brasileira: 12345.6 → "R$ 12.345,60" */
export function brl(valor: number, semCentavos = false): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: semCentavos ? 0 : 2,
    maximumFractionDigits: semCentavos ? 0 : 2,
  });
}
