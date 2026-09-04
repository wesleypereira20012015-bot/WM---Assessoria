/**
 * Bytes para base64, em blocos.
 *
 * `String.fromCharCode(...bytes)` estoura a pilha com imagem de alguns
 * megabytes, que é exatamente o nosso caso ao embutir a foto no SVG.
 */
export function paraBase64(bytes: Uint8Array): string {
  const BLOCO = 0x8000;
  let bin = "";
  for (let i = 0; i < bytes.length; i += BLOCO) {
    bin += String.fromCharCode(...bytes.subarray(i, i + BLOCO));
  }
  return btoa(bin);
}
