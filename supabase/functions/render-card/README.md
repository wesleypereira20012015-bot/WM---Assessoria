# render-card

Transforma uma prancha de carrossel em arte pronta para o Instagram: acha
uma foto real, compõe a peça, rasteriza em JPEG 1080x1350, sobe no bucket
público e grava o crédito do fotógrafo.

## Como chamar

```
POST https://SEU-PROJETO.supabase.co/functions/v1/render-card
Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>
Content-Type: application/json

{
  "publicacao_id": "uuid da publicação",
  "ordem": 1,
  "total": 5,
  "card": {
    "tipo": "capa",
    "titulo": "texto grande da prancha",
    "corpo": "texto de apoio, uma frase curta",
    "busca_foto": "termo de busca em inglês para o banco de imagens"
  }
}
```

Resposta:

```json
{
  "url_publica": "https://.../publicacoes/<publicacao_id>/1.jpg?v=...",
  "fonte_foto": "pexels",
  "credito_fotografo": "Nome do Fotógrafo",
  "largura": 1080, "altura": 1350, "bytes": 214503
}
```

A função **só aceita a service role key** no `Authorization`. É chamada pelo
n8n e pelo servidor do site, nunca pelo navegador.

`tipo` aceita `capa` (título maior, para a primeira prancha) ou qualquer
outro valor, tratado como prancha de conteúdo.

## Variáveis que a função precisa

`SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` o Supabase injeta sozinho. Você
só precisa cadastrar, em Edge Functions → Secrets:

- `PEXELS_API_KEY`
- `UNSPLASH_ACCESS_KEY`

Sem nenhuma das duas, a função devolve erro. Ela não tem plano C: não existe
imagem gerada, nem fundo de cor chapada disfarçado de arte.

## O que a arte garante

- **JPEG**, nunca PNG, porque é o que o Instagram aceita para publicação.
- **1080x1350** (proporção 4:5), dentro da faixa que o Instagram exige, e a
  rasterização falha em vez de entregar tamanho errado.
- **Foto real** de Pexels ou Unsplash, com crédito do fotógrafo salvo em
  `assets` junto com o link do original.
- **Sem travessão** em nenhum texto renderizado: a arte troca por vírgula na
  entrada, então não depende de quem escreveu o texto ter respeitado a regra.
- Marinho, ouro, champagne e creme da marca, títulos em Cormorant Garamond
  SemiBold, corpo em Inter Light, e o monograma WM no rodapé de toda prancha
  (os mesmos traços de `components/Logo.tsx`).

## Ver a arte antes de ligar no resto

```bash
npm run arte
```

Gera as pranchas de uma publicação de exemplo em `.arte-exemplo/` e confere
cada uma: é JPEG, está em 1080x1350, cabe no limite de 8 MB do Instagram, o
texto foi mesmo desenhado e não sobrou travessão.

Com `PEXELS_API_KEY` ou `UNSPLASH_ACCESS_KEY` no ambiente, busca foto real
igual à produção. Sem chave, usa fotos que já estão no repositório só para
você julgar a composição, e avisa disso na saída.

## Como os arquivos se dividem

| Arquivo | Papel |
| --- | --- |
| `index.ts` | O endpoint. Valida a entrada, orquestra e grava. |
| `fotos.ts` | Pexels, com Unsplash de reserva. Nunca inventa imagem. |
| `arte.ts` | A composição em SVG. É o único lugar que decide o visual. |
| `metricas.ts` | Lê as larguras dos glifos no TTF para quebrar linha certo. |
| `imagem.ts` | SVG para PNG (resvg) e PNG para JPEG (imagescript). |
| `marca.ts` | As fontes carregadas uma vez por processo. |
| `fontes.ts` | Gerado. Fontes da marca em base64. |
| `gerar-fontes.ts` | Regera o arquivo acima (`npm run arte:fontes`). |
| `teste-local.ts` | O teste que gera a arte de exemplo. |

`arte.ts`, `metricas.ts`, `texto.ts` e `base64.ts` são código puro, sem
nenhuma API de runtime: rodam igual no Deno da Edge Function e no Node do
teste local. É isso que faz o teste valer alguma coisa, porque ele exercita
exatamente o mesmo código que roda em produção.

## Por que as fontes estão embutidas em base64

O resvg não usa fonte do sistema aqui: as fontes precisam chegar como bytes.
Ler arquivo estático no deploy exigiria `static_files` no `config.toml`, CLI
2.7+ e Docker. Embutidas num módulo TypeScript, funcionam em qualquer caminho
de deploy e sem depender de rede para carregar. (O binário Wasm do resvg, esse
sim, é buscado de um CDN uma vez por cold start.) As fontes vêm da API
do Google Fonts já subsetadas para o alfabeto da arte, o que segura o arquivo
em cerca de 250 KB. Cormorant Garamond e Inter são licenciadas sob a SIL Open
Font License, que permite essa redistribuição (veja `OFL.txt`).

**Um cuidado ao mexer aqui:** o resvg não reclama quando o SVG pede uma
família que não existe, ele cai calado na primeira fonte carregada. Um título
sairia em Inter sem nenhum erro. Por isso o teste local compara a prancha com
o título em Cormorant e em Inter e exige que as duas saiam diferentes.

## Deploy

```bash
supabase functions deploy render-card
```

Ou pelo painel, em Edge Functions. A função não precisa de `static_files`
nem de nenhuma flag especial.
