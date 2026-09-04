/**
 * Fontes da marca já carregadas e medidas.
 *
 * A leitura das tabelas do TTF acontece uma vez por processo, no import.
 * Na Edge Function isso cai no cold start; nas invocações seguintes é
 * memória.
 */

import { CORMORANT_SEMIBOLD, FONTES, INTER_LIGHT, INTER_SEMIBOLD } from "./fontes.ts";
import { lerFonte } from "./metricas.ts";
import type { FontesDaMarca } from "./arte.ts";

/** Larguras de glifo, para a arte saber onde quebrar linha. */
export const fontesDaMarca: FontesDaMarca = {
  titulo: lerFonte(CORMORANT_SEMIBOLD),
  corpo: lerFonte(INTER_LIGHT),
  etiqueta: lerFonte(INTER_SEMIBOLD),
};

/** Os mesmos arquivos, crus, para o resvg desenhar. */
export const buffersDeFonte: Uint8Array[] = FONTES;
