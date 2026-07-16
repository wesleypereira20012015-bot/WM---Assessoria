/**
 * ============================================================
 *  TABELAS OFICIAIS DO CÁLCULO (SERO / aferição indireta)
 * ============================================================
 *  Extraídas da calculadora oficial da WM (Simulador de INSS
 *  de Obras) em julho/2026. Estes números reproduzem EXATAMENTE
 *  a calculadora de referência.
 *
 *  ⚠️ Em geral você NÃO precisa mexer aqui. Os VAUs (valor por m²
 *  de cada estado) são atualizados periodicamente pela Receita;
 *  quando quiser atualizar, troque apenas os números.
 * ============================================================
 */

/** VAU (R$ por m²) por estado e destinação + percentual de concreto (cu). */
export interface VauUF {
  uf: string;
  casaPopular: number;
  comercial: number;
  conjHabPopular: number;
  garagens: number;
  galpaoIndustrial: number;
  residMultifamiliar: number;
  residUnifamiliar: number;
  /** percentuais de concreto usinado por destinação (para o crédito de 5%) */
  cu: {
    casaPopular: number;
    comercial: number;
    conjHabPopular: number;
    garagens: number;
    galpaoIndustrial: number;
    residMultifamiliar: number;
    residUnifamiliar: number;
  };
}

export const vaus: VauUF[] = [
  {
    uf: "AC - Acre",
    casaPopular: 2108.41, comercial: 3905.95, conjHabPopular: 2108.41,
    garagens: 3905.95, galpaoIndustrial: 1805.72,
    residMultifamiliar: 3527.09, residUnifamiliar: 4173.03,
    cu: { casaPopular: 4.69, comercial: 13.33, conjHabPopular: 4.69, garagens: 13.33, galpaoIndustrial: 4.52, residMultifamiliar: 9.61, residUnifamiliar: 7.43 },
  },
  {
    uf: "AL - Alagoas",
    casaPopular: 1340.22, comercial: 2425.89, conjHabPopular: 1340.22,
    garagens: 2425.89, galpaoIndustrial: 1133.11,
    residMultifamiliar: 2168.76, residUnifamiliar: 2516.56,
    cu: { casaPopular: 3.98, comercial: 11.35, conjHabPopular: 3.98, garagens: 11.35, galpaoIndustrial: 3.82, residMultifamiliar: 8.12, residUnifamiliar: 6.11 },
  },
  {
    uf: "AM - Amazonas",
    casaPopular: 2108.41, comercial: 3905.95, conjHabPopular: 2108.41,
    garagens: 3905.95, galpaoIndustrial: 1805.72,
    residMultifamiliar: 3527.09, residUnifamiliar: 4173.03,
    cu: { casaPopular: 4.69, comercial: 13.33, conjHabPopular: 4.69, garagens: 13.33, galpaoIndustrial: 4.52, residMultifamiliar: 9.61, residUnifamiliar: 7.43 },
  },
  {
    uf: "AP - Amapá",
    casaPopular: 1871.23, comercial: 3330.86, conjHabPopular: 1871.23,
    garagens: 3330.86, galpaoIndustrial: 1583.35,
    residMultifamiliar: 2934.00, residUnifamiliar: 3322.00,
    cu: { casaPopular: 4.88, comercial: 12.93, conjHabPopular: 4.88, garagens: 12.93, galpaoIndustrial: 4.38, residMultifamiliar: 9.41, residUnifamiliar: 7.48 },
  },
  {
    uf: "BA - Bahia",
    casaPopular: 1463.53, comercial: 2599.29, conjHabPopular: 1463.53,
    garagens: 2599.29, galpaoIndustrial: 1179.31,
    residMultifamiliar: 2269.50, residUnifamiliar: 2707.88,
    cu: { casaPopular: 3.73, comercial: 10.31, conjHabPopular: 3.73, garagens: 10.31, galpaoIndustrial: 3.62, residMultifamiliar: 7.46, residUnifamiliar: 5.53 },
  },
  {
    uf: "CE - Ceará",
    casaPopular: 1668.13, comercial: 2798.73, conjHabPopular: 1668.13,
    garagens: 2798.73, galpaoIndustrial: 1325.85,
    residMultifamiliar: 2458.81, residUnifamiliar: 2831.47,
    cu: { casaPopular: 3.70, comercial: 10.69, conjHabPopular: 3.70, garagens: 10.69, galpaoIndustrial: 3.44, residMultifamiliar: 7.69, residUnifamiliar: 5.72 },
  },
  {
    uf: "DF - Distrito Federal",
    casaPopular: 1562.69, comercial: 2832.77, conjHabPopular: 1562.69,
    garagens: 2832.77, galpaoIndustrial: 1266.97,
    residMultifamiliar: 2475.34, residUnifamiliar: 2856.68,
    cu: { casaPopular: 3.53, comercial: 9.62, conjHabPopular: 3.53, garagens: 9.62, galpaoIndustrial: 3.43, residMultifamiliar: 7.06, residUnifamiliar: 5.24 },
  },
  {
    uf: "ES - Espírito Santo",
    casaPopular: 1885.33, comercial: 3173.93, conjHabPopular: 1885.33,
    garagens: 3173.93, galpaoIndustrial: 1438.25,
    residMultifamiliar: 2848.23, residUnifamiliar: 3347.80,
    cu: { casaPopular: 3.33, comercial: 9.45, conjHabPopular: 3.33, garagens: 9.45, galpaoIndustrial: 3.26, residMultifamiliar: 6.85, residUnifamiliar: 5.15 },
  },
  {
    uf: "GO - Goiás",
    casaPopular: 1493.49, comercial: 2660.91, conjHabPopular: 1493.49,
    garagens: 2660.91, galpaoIndustrial: 1243.51,
    residMultifamiliar: 2337.32, residUnifamiliar: 2799.57,
    cu: { casaPopular: 3.88, comercial: 10.27, conjHabPopular: 3.33, garagens: 9.45, galpaoIndustrial: 3.26, residMultifamiliar: 6.85, residUnifamiliar: 5.15 },
  },
  {
    uf: "MA - Maranhão",
    casaPopular: 1291.20, comercial: 2256.72, conjHabPopular: 1291.20,
    garagens: 2256.72, galpaoIndustrial: 1076.84,
    residMultifamiliar: 2209.94, residUnifamiliar: 2310.36,
    cu: { casaPopular: 4.18, comercial: 12.06, conjHabPopular: 4.18, garagens: 12.06, galpaoIndustrial: 4.07, residMultifamiliar: 8.73, residUnifamiliar: 6.94 },
  },
  {
    uf: "MG - Minas Gerais",
    casaPopular: 1697.82, comercial: 2942.85, conjHabPopular: 1697.82,
    garagens: 2942.85, galpaoIndustrial: 1294.61,
    residMultifamiliar: 2621.01, residUnifamiliar: 3021.18,
    cu: { casaPopular: 3.15, comercial: 8.66, conjHabPopular: 3.15, garagens: 8.66, galpaoIndustrial: 3.05, residMultifamiliar: 6.22, residUnifamiliar: 4.68 },
  },
  {
    uf: "MS - Mato Grosso do Sul",
    casaPopular: 1271.56, comercial: 2307.24, conjHabPopular: 1271.56,
    garagens: 2307.24, galpaoIndustrial: 1040.06,
    residMultifamiliar: 1856.28, residUnifamiliar: 2216.19,
    cu: { casaPopular: 4.34, comercial: 12.20, conjHabPopular: 4.34, garagens: 12.20, galpaoIndustrial: 4.28, residMultifamiliar: 8.74, residUnifamiliar: 6.74 },
  },
  {
    uf: "MT - Mato Grosso",
    casaPopular: 2186.14, comercial: 3893.08, conjHabPopular: 2186.14,
    garagens: 3893.08, galpaoIndustrial: 1711.99,
    residMultifamiliar: 3425.98, residUnifamiliar: 3942.13,
    cu: { casaPopular: 4.02, comercial: 10.96, conjHabPopular: 4.02, garagens: 10.96, galpaoIndustrial: 3.89, residMultifamiliar: 8.01, residUnifamiliar: 6.22 },
  },
  {
    uf: "PA - Pará",
    casaPopular: 1628.40, comercial: 2822.51, conjHabPopular: 1628.40,
    garagens: 2822.51, galpaoIndustrial: 1334.75,
    residMultifamiliar: 2506.90, residUnifamiliar: 2869.77,
    cu: { casaPopular: 4.91, comercial: 13.48, conjHabPopular: 4.91, garagens: 13.48, galpaoIndustrial: 4.45, residMultifamiliar: 9.77, residUnifamiliar: 7.58 },
  },
  {
    uf: "PB - Paraíba",
    casaPopular: 1116.89, comercial: 2055.82, conjHabPopular: 1116.89,
    garagens: 2055.82, galpaoIndustrial: 944.87,
    residMultifamiliar: 1828.89, residUnifamiliar: 2063.83,
    cu: { casaPopular: 4.12, comercial: 11.81, conjHabPopular: 4.12, garagens: 11.81, galpaoIndustrial: 3.81, residMultifamiliar: 8.58, residUnifamiliar: 6.32 },
  },
  {
    uf: "PE - Pernambuco",
    casaPopular: 1527.79, comercial: 2613.55, conjHabPopular: 1527.79,
    garagens: 2613.55, galpaoIndustrial: 1196.04,
    residMultifamiliar: 2302.97, residUnifamiliar: 2753.74,
    cu: { casaPopular: 3.51, comercial: 9.74, conjHabPopular: 3.51, garagens: 9.47, galpaoIndustrial: 3.42, residMultifamiliar: 6.89, residUnifamiliar: 5.12 },
  },
  {
    uf: "PI - Piauí",
    casaPopular: 1291.20, comercial: 2256.72, conjHabPopular: 1291.20,
    garagens: 2256.72, galpaoIndustrial: 1076.84,
    residMultifamiliar: 1992.49, residUnifamiliar: 2310.36,
    cu: { casaPopular: 3.53, comercial: 10.00, conjHabPopular: 3.53, garagens: 10.00, galpaoIndustrial: 3.30, residMultifamiliar: 7.16, residUnifamiliar: 5.33 },
  },
  {
    uf: "PR - Paraná",
    casaPopular: 1797.56, comercial: 3200.16, conjHabPopular: 1797.56,
    garagens: 3200.16, galpaoIndustrial: 1434.36,
    residMultifamiliar: 2798.60, residUnifamiliar: 3285.63,
    cu: { casaPopular: 3.18, comercial: 8.78, conjHabPopular: 3.18, garagens: 8.78, galpaoIndustrial: 3.08, residMultifamiliar: 6.50, residUnifamiliar: 4.91 },
  },
  {
    uf: "RJ - Rio de Janeiro",
    casaPopular: 1703.57, comercial: 2986.99, conjHabPopular: 1703.57,
    garagens: 2986.99, galpaoIndustrial: 1356.28,
    residMultifamiliar: 2626.15, residUnifamiliar: 3050.58,
    cu: { casaPopular: 3.20, comercial: 9.02, conjHabPopular: 3.20, garagens: 9.02, galpaoIndustrial: 3.08, residMultifamiliar: 6.52, residUnifamiliar: 4.94 },
  },
  {
    uf: "RN - Rio Grande do Norte",
    casaPopular: 1505.99, comercial: 2491.63, conjHabPopular: 1505.99,
    garagens: 2491.63, galpaoIndustrial: 1197.84,
    residMultifamiliar: 2239.04, residUnifamiliar: 2607.99,
    cu: { casaPopular: 4.01, comercial: 10.41, conjHabPopular: 4.01, garagens: 10.41, galpaoIndustrial: 3.63, residMultifamiliar: 7.62, residUnifamiliar: 5.96 },
  },
  {
    uf: "RO - Rondônia",
    casaPopular: 1710.72, comercial: 2995.23, conjHabPopular: 1710.72,
    garagens: 2995.23, galpaoIndustrial: 1335.49,
    residMultifamiliar: 2648.29, residUnifamiliar: 2910.32,
    cu: { casaPopular: 4.02, comercial: 10.96, conjHabPopular: 4.02, garagens: 10.96, galpaoIndustrial: 3.89, residMultifamiliar: 8.01, residUnifamiliar: 6.22 },
  },
  {
    uf: "RR - Roraima",
    casaPopular: 1882.25, comercial: 3537.22, conjHabPopular: 1882.25,
    garagens: 3537.22, galpaoIndustrial: 1695.52,
    residMultifamiliar: 3104.74, residUnifamiliar: 3622.43,
    cu: { casaPopular: 4.69, comercial: 13.33, conjHabPopular: 4.69, garagens: 13.33, galpaoIndustrial: 4.52, residMultifamiliar: 9.61, residUnifamiliar: 7.43 },
  },
  {
    uf: "RS - Rio Grande do Sul",
    casaPopular: 1824.49, comercial: 3580.65, conjHabPopular: 1824.49,
    garagens: 3580.65, galpaoIndustrial: 1389.37,
    residMultifamiliar: 3019.43, residUnifamiliar: 3410.64,
    cu: { casaPopular: 3.25, comercial: 8.77, conjHabPopular: 3.25, garagens: 8.77, galpaoIndustrial: 3.23, residMultifamiliar: 6.54, residUnifamiliar: 5.01 },
  },
  {
    uf: "SC - Santa Catarina",
    casaPopular: 1962.44, comercial: 3355.23, conjHabPopular: 1962.44,
    garagens: 3355.23, galpaoIndustrial: 1552.11,
    residMultifamiliar: 2919.91, residUnifamiliar: 3441.12,
    cu: { casaPopular: 2.93, comercial: 8.36, conjHabPopular: 2.93, garagens: 8.36, galpaoIndustrial: 2.87, residMultifamiliar: 6.19, residUnifamiliar: 4.79 },
  },
  {
    uf: "SE - Sergipe",
    casaPopular: 1373.83, comercial: 2543.34, conjHabPopular: 1373.83,
    garagens: 2543.34, galpaoIndustrial: 1169.38,
    residMultifamiliar: 2270.89, residUnifamiliar: 2506.98,
    cu: { casaPopular: 4.34, comercial: 12.50, conjHabPopular: 4.34, garagens: 12.50, galpaoIndustrial: 4.18, residMultifamiliar: 9.05, residUnifamiliar: 6.97 },
  },
  {
    uf: "SP - São Paulo",
    casaPopular: 1492.42, comercial: 2642.22, conjHabPopular: 1492.42,
    garagens: 2642.22, galpaoIndustrial: 1244.80,
    residMultifamiliar: 2321.06, residUnifamiliar: 2661.22,
    cu: { casaPopular: 3.15, comercial: 8.69, conjHabPopular: 3.15, garagens: 8.69, galpaoIndustrial: 2.96, residMultifamiliar: 6.35, residUnifamiliar: 4.90 },
  },
  {
    uf: "TO - Tocantins",
    casaPopular: 1493.49, comercial: 2660.91, conjHabPopular: 1493.49,
    garagens: 2660.91, galpaoIndustrial: 1243.51,
    residMultifamiliar: 2337.32, residUnifamiliar: 2799.57,
    cu: { casaPopular: 3.53, comercial: 10.00, conjHabPopular: 3.53, garagens: 10.00, galpaoIndustrial: 3.30, residMultifamiliar: 7.15, residUnifamiliar: 5.33 },
  },
]

/** Destinações da obra: percentual aplicado sobre o VAU e limites de área. */
export const destinacoes = [
  { id: "residUnifamiliar", nome: "Residência unifamiliar (casa)", percentual: 0.89, percentualAcimaLimite: 0.85, limiteM2: 999.99 },
  { id: "residMultifamiliar", nome: "Residência multifamiliar (prédio)", percentual: 0.90, percentualAcimaLimite: 0.86, limiteM2: 999.99 },
  { id: "comercial", nome: "Comercial (salas, lojas, escritórios)", percentual: 0.86, percentualAcimaLimite: 0.83, limiteM2: 2999.99 },
  { id: "galpaoIndustrial", nome: "Galpão industrial", percentual: 0.95, percentualAcimaLimite: null, limiteM2: null },
  { id: "garagens", nome: "Edifício de garagens", percentual: 0.86, percentualAcimaLimite: 0.83, limiteM2: 2999.99 },
  { id: "casaPopular", nome: "Casa popular", percentual: 0.98, percentualAcimaLimite: null, limiteM2: null },
  { id: "conjHabPopular", nome: "Conjunto habitacional popular", percentual: 0.98, percentualAcimaLimite: 0.98, limiteM2: null },
] as const;

/** Categoria da obra (multiplicador sobre o custo). */
export const categorias = [
  { id: "obraNova", nome: "Obra nova", fator: 1.0 },
  { id: "acrescimo", nome: "Acréscimo (ampliação)", fator: 1.0 },
  { id: "reforma", nome: "Reforma", fator: 0.35 },
  { id: "demolicao", nome: "Demolição", fator: 0.1 },
] as const;

/** Tipo de construção (percentual de mão de obra sobre o custo). */
export const materiais = [
  { id: "alvenaria", nome: "Alvenaria (tijolo/concreto)", percentualMO: 0.20 },
  { id: "madeira", nome: "Madeira", percentualMO: 0.15 },
  { id: "mista", nome: "Mista (alvenaria + madeira)", percentualMO: 0.15 },
] as const;

/** Fator social (só pessoa física), pela ÁREA TOTAL da obra. */
export const fatoresSociais = [
  { ateM2: 100, fator: 0.2 },
  { ateM2: 200, fator: 0.4 },
  { ateM2: 300, fator: 0.55 },
  { ateM2: 400, fator: 0.7 },
  { ateM2: Infinity, fator: 0.9 },
] as const;

/** Alíquota sobre a mão de obra, por regime tributário. */
export const regimes = [
  { id: "pf", nome: "Pessoa física", aliquota: 0.368 },
  { id: "simples", nome: "Simples Nacional", aliquota: 0.31 },
  { id: "simplesDesonerado", nome: "Simples Nacional desonerado", aliquota: 0.16 },
  { id: "presumido", nome: "Lucro Presumido", aliquota: 0.368 },
  { id: "presumidoDesonerado", nome: "Lucro Presumido desonerado", aliquota: 0.218 },
  { id: "real", nome: "Lucro Real", aliquota: 0.368 },
  { id: "realDesonerado", nome: "Lucro Real desonerado", aliquota: 0.218 },
] as const;

/** No conjunto habitacional popular, a mão de obra muda para: */
export const moConjHabPopular = { alvenaria: 0.12, madeira: 0.07, mista: 0.07 };
