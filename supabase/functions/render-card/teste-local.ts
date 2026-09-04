/**
 * Teste local do renderizador.
 *
 * Gera as pranchas de uma publicação de exemplo e salva em `.arte-exemplo/`
 * para conferir a arte antes de ligar isso no resto do sistema.
 *
 * Rodar com:  npm run arte
 *
 * Com PEXELS_API_KEY ou UNSPLASH_ACCESS_KEY no ambiente, busca foto real,
 * exatamente como a Edge Function faz em produção. Sem chave, cai para uma
 * foto local só para você julgar a composição, e avisa disso em alto e bom
 * som. Em nenhum dos dois casos existe imagem gerada.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Image } from "imagescript";

import { ALTURA, LARGURA, montarSvg, type Card } from "./arte.ts";
import { paraBase64 } from "./base64.ts";
import { buscarFoto } from "./fotos.ts";
import { prepararRasterizador, svgParaJpeg } from "./imagem.ts";
import { buffersDeFonte, fontesDaMarca } from "./marca.ts";
import { limpar, temTravessao } from "./texto.ts";

const aqui = path.dirname(fileURLToPath(import.meta.url));
const raiz = path.resolve(aqui, "../../..");
const saida = path.join(raiz, ".arte-exemplo");

/** Limite do Instagram por imagem. */
const LIMITE_INSTAGRAM = 8 * 1024 * 1024;

/**
 * Publicação de exemplo, no assunto real da WM.
 * O título da prancha 3 é propositalmente longo, para provar que o título
 * encolhe em vez de vazar. A 4 tem travessão de propósito, para provar que
 * ele não chega na arte.
 */
const EXEMPLO: Card[] = [
  {
    ordem: 1,
    tipo: "capa",
    titulo: "Sua obra pode estar pagando INSS a mais",
    corpo: "O que quase todo construtor descobre tarde demais sobre a aferição da Receita Federal.",
    busca_foto: "construction site building facade brazil",
  },
  {
    ordem: 2,
    tipo: "conteudo",
    titulo: "A Receita calcula por estimativa",
    corpo:
      "Sem a documentação certa, o cálculo do INSS da obra sai por área construída, e quase sempre acima do que a obra realmente deve.",
    busca_foto: "architect blueprint desk documents",
  },
  {
    ordem: 3,
    tipo: "conteudo",
    titulo: "Nota fiscal de material e de mão de obra derruba a base de cálculo da aferição",
    corpo: "Cada documento aceito pela Receita reduz o valor que a obra vai pagar.",
    busca_foto: "invoice paperwork office desk",
  },
  {
    ordem: 4,
    tipo: "conteudo",
    titulo: "CNO em dia — a porta de entrada",
    corpo:
      "Sem o Cadastro Nacional de Obras regular, não sai CND. E sem CND, não sai habite-se nem financiamento.",
    busca_foto: "city hall building documents approval",
  },
  {
    ordem: 5,
    tipo: "fechamento",
    titulo: "Antes de pagar, mande revisar",
    corpo: "A WM Assessoria revisa o cálculo da sua obra e mostra quanto dá para reduzir.",
    busca_foto: "professional consultant meeting handshake office",
  },
];

/** Fotos reais que já estão no repositório, para rodar sem chave de API. */
const FOTOS_LOCAIS = [
  "public/images/equipe-mirela.jpeg",
  "public/images/equipe-wesley.png",
];

function mime(arquivo: string): string {
  return arquivo.endsWith(".png") ? "image/png" : "image/jpeg";
}

/**
 * Conta pixels claros na área do texto.
 *
 * Se o nome da família da fonte não bater com o que o SVG pede, o resvg não
 * desenha nada e devolve uma imagem só com a foto e o véu, sem erro nenhum.
 * Comparar essa contagem com a da mesma prancha sem os `<text>` mostra
 * quanto o texto acrescentou, e pega essa falha silenciosa sem depender de
 * um limiar chutado (foto clara e foto escura dão contagens bem diferentes).
 */
function pixelsClaros(imagem: Image): number {
  const { bitmap, width } = imagem;
  let claros = 0;
  for (let y = 380; y < 1180; y += 2) {
    for (let x = 104; x < 976; x += 2) {
      const i = (y * width + x) * 4;
      if (bitmap[i] > 200 && bitmap[i + 1] > 195 && bitmap[i + 2] > 185) claros++;
    }
  }
  return claros;
}

async function main(): Promise<void> {
  const chaves = {
    pexels: process.env.PEXELS_API_KEY,
    unsplash: process.env.UNSPLASH_ACCESS_KEY,
  };
  const comChave = Boolean(chaves.pexels || chaves.unsplash);

  console.log("Fontes carregadas:");
  console.log(`  título   ${fontesDaMarca.titulo.familia}`);
  console.log(`  corpo    ${fontesDaMarca.corpo.familia}`);
  console.log(`  etiqueta ${fontesDaMarca.etiqueta.familia}`);
  console.log();

  if (comChave) {
    console.log("Buscando foto real em Pexels/Unsplash.\n");
  } else {
    console.log("ATENÇÃO: sem PEXELS_API_KEY e sem UNSPLASH_ACCESS_KEY.");
    console.log("Usando fotos locais do repositório só para julgar a composição.");
    console.log("Em produção a função exige foto de Pexels ou Unsplash e falha sem elas.\n");
  }

  const wasm = await readFile(
    path.join(raiz, "node_modules/@resvg/resvg-wasm/index_bg.wasm"),
  );
  await prepararRasterizador(wasm);
  await mkdir(saida, { recursive: true });

  const problemas: string[] = [];

  for (const card of EXEMPLO) {
    let fotoBase64: string;
    let fotoMime: string;
    let credito: string;

    if (comChave) {
      const foto = await buscarFoto(card.busca_foto, chaves);
      fotoBase64 = paraBase64(foto.bytes);
      fotoMime = foto.mime;
      credito = `${foto.fonte}, ${foto.creditoFotografo}`;
    } else {
      const arquivo = FOTOS_LOCAIS[(card.ordem - 1) % FOTOS_LOCAIS.length];
      const bytes = await readFile(path.join(raiz, arquivo));
      fotoBase64 = paraBase64(new Uint8Array(bytes));
      fotoMime = mime(arquivo);
      credito = `local, ${path.basename(arquivo)}`;
    }

    const svg = montarSvg({
      card,
      fotoBase64,
      fotoMime,
      total: EXEMPLO.length,
      fontes: fontesDaMarca,
    });

    const jpeg = await svgParaJpeg(svg, buffersDeFonte);
    const arquivo = path.join(saida, `${card.ordem}.jpg`);
    await writeFile(arquivo, jpeg.bytes);

    // ---- Conferências ----
    const rotulo = `prancha ${card.ordem}`;

    if (jpeg.bytes[0] !== 0xff || jpeg.bytes[1] !== 0xd8) {
      problemas.push(`${rotulo}: não é JPEG`);
    }
    if (jpeg.largura !== LARGURA || jpeg.altura !== ALTURA) {
      problemas.push(`${rotulo}: saiu ${jpeg.largura}x${jpeg.altura}`);
    }
    if (jpeg.bytes.byteLength > LIMITE_INSTAGRAM) {
      problemas.push(`${rotulo}: ${jpeg.bytes.byteLength} bytes, acima do limite do Instagram`);
    }
    if (temTravessao(limpar(card.titulo)) || temTravessao(limpar(card.corpo ?? ""))) {
      problemas.push(`${rotulo}: sobrou travessão no texto`);
    }

    // Mesma prancha, sem os <text>: o que sobra é só foto e véu.
    const semTexto = await svgParaJpeg(svg.replace(/<text[\s\S]*?<\/text>/g, ""), buffersDeFonte);
    const ganho =
      pixelsClaros(await Image.decode(jpeg.bytes)) -
      pixelsClaros(await Image.decode(semTexto.bytes));
    if (ganho < 800) {
      problemas.push(`${rotulo}: o texto não foi desenhado (só ${ganho} pixels a mais)`);
    }

    // Uma vez basta: prova que o resvg carregou as duas famílias e escolhe
    // pelo nome. Se só uma tivesse carregado, ele usaria essa para tudo,
    // sem erro nenhum, e o título sairia na fonte errada.
    if (card.ordem === 1) {
      const comInter = await svgParaJpeg(
        svg.replace(new RegExp(fontesDaMarca.titulo.familia, "g"), fontesDaMarca.corpo.familia),
        buffersDeFonte,
      );
      const diferenca = Math.abs(
        pixelsClaros(await Image.decode(comInter.bytes)) -
          pixelsClaros(await Image.decode(jpeg.bytes)),
      );
      if (diferenca < 200) {
        problemas.push(
          `${rotulo}: título em ${fontesDaMarca.titulo.familia} saiu igual ao título em ` +
            `${fontesDaMarca.corpo.familia}; provavelmente só uma fonte carregou`,
        );
      }
    }

    const kb = (jpeg.bytes.byteLength / 1024).toFixed(0);
    console.log(
      `${rotulo}  ${jpeg.largura}x${jpeg.altura}  ${kb.padStart(4)} KB  ` +
        `texto +${String(ganho).padStart(5)} px  foto: ${credito}`,
    );
  }

  console.log(`\nArquivos em ${path.relative(raiz, saida)}/`);

  if (problemas.length) {
    console.error("\nFALHAS:");
    for (const p of problemas) console.error(`  ${p}`);
    process.exit(1);
  }
  console.log("Tudo conferido: JPEG, 1080x1350, dentro do limite, texto desenhado, sem travessão.");
}

main().catch((erro) => {
  console.error(erro instanceof Error ? erro.stack ?? erro.message : erro);
  process.exit(1);
});
