# Como editar o site — guia rápido (sem programação)

Este guia mostra como mudar **textos, fotos, depoimentos, FAQ** e como **ver os leads**.

> **O caminho mais fácil de todos:** abra esta pasta no Claude Code e peça em
> português — "troque o texto X por Y", "adicione um depoimento do cliente Z",
> "coloque esta foto no topo". Ele edita, testa e te mostra o resultado.

---

## 1. Onde fica cada coisa

| O que você quer mudar | Onde mexer |
|---|---|
| Qualquer texto, número ou link do site | arquivo **`content/site.ts`** |
| Fotos (topo, equipe, galeria de obras) | pasta **`public/images/`** |
| Parâmetros da calculadora (valores por m², faixas, alíquotas) | `content/site.ts`, bloco `calculadora.parametros` |
| Senha do painel de leads | variável `ADMIN_PASSWORD` (arquivo `.env.local` ou painel da Vercel) |

## 2. Editando textos (`content/site.ts`)

**Truque para achar qualquer texto:**
1. No site, copie um pedaço da frase que você quer mudar.
2. Abra `content/site.ts` em qualquer editor (recomendo o [VS Code](https://code.visualstudio.com), gratuito — mas até o TextEdit/Bloco de Notas serve).
3. Aperte `Cmd+F` (Mac) ou `Ctrl+F` (Windows), cole a frase e dê Enter — você cai direto na linha certa.
4. **Altere apenas o que está entre aspas** `"..."` ou os números. Não apague vírgulas, chaves `{ }` nem colchetes `[ ]`.
5. Dica: nos títulos, a palavra entre `*asteriscos*` fica **dourada** no site.

### Adicionar/remover um depoimento
No bloco `resultados.depoimentos`, copie um bloco inteiro de `{ ... },` e cole logo abaixo, alterando os textos. Para remover, apague o bloco inteiro (da `{` até a `},`).

### Adicionar/remover pergunta do FAQ
Mesma lógica, no bloco `faq.perguntas`.

## 3. Fotos — é só salvar com o nome certo

Nenhuma edição de código: o site encontra as fotos sozinho pela pasta e pelo nome.

| Foto | Onde salvar | O que acontece |
|---|---|---|
| Foto grande do topo | `public/images/hero.jpg` | Substitui a ilustração do topo (o site escurece a foto para o texto ficar legível) |
| Wesley | `public/images/equipe-wesley.jpg` | Aparece em "Quem somos" |
| Mirela | `public/images/equipe-mirela.jpg` | Aparece em "Quem somos" |
| Galeria de obras | `public/images/obras/nome-da-obra.jpg` | Cada foto entra sozinha na seção "Resultados"; o nome do arquivo vira a legenda (`casa-em-araras.jpg` → "Casa em araras") |
| Compartilhamento | `public/images/og.png` (1200×630) | Imagem que aparece ao mandar o link no WhatsApp |

Detalhes e dicas no arquivo `public/images/LEIA-ME.txt`.

## 3b. A calculadora

A calculadora usa **as mesmas tabelas oficiais da sua calculadora do Simulador de INSS de Obras** (VAU por estado, fator social, destinações, materiais, regimes) — o resultado é idêntico para os mesmos dados.

- As tabelas ficam em `content/tabelas-sero.ts` (só mexa para atualizar os VAUs quando a Receita atualizar);
- Os ajustes de marketing (estado padrão, faixa de economia mostrada, anos de decadência) ficam em `content/site.ts`, bloco `calculadora.parametros`.

## 4. Blog — adicionar um artigo é criar um arquivo

Cada arquivo `.md` dentro de `content/blog/` vira um artigo automaticamente. O nome do arquivo vira o endereço: `content/blog/meu-artigo.md` → `seusite.com.br/blog/meu-artigo`.

**Para criar um artigo**, copie um dos arquivos existentes e edite. O formato:

```
---
titulo: O título que aparece no site
descricao: Um resumo de 1-2 frases (aparece no card e no Google)
data: 2026-07-15
capa: /images/blog/minha-foto.jpg   ← opcional (foto em public/images/blog/)
---

O texto do artigo vem aqui. Parágrafos separados por linha em branco.

## Subtítulo grande

### Subtítulo menor

- Lista de itens
- Outro item

**negrito** e *itálico* funcionam. Links: [texto](https://endereco.com)

Foto no meio do texto: ![legenda](/images/blog/outra-foto.jpg)

> Frase de destaque em citação.
```

**Para remover um artigo:** apague o arquivo. **Para editar:** edite e salve. Os artigos aparecem do mais novo para o mais antigo (pela `data`).

## 4. Vendo os leads capturados

1. Acesse **`seusite.com.br/admin`** (em desenvolvimento: `localhost:3000/admin`).
2. Digite a senha (a que você definiu em `ADMIN_PASSWORD`).
3. Você verá a lista com data, nome, WhatsApp, dados da obra e resultado da simulação.
4. O botão **“Baixar CSV”** exporta tudo para abrir no Excel.
5. Clique no número de WhatsApp de qualquer lead para abrir a conversa direto.

## 5. Publicando as alterações

- **Se o site está na Vercel conectado ao GitHub:** salve as alterações, faça *commit* e *push* — a Vercel publica sozinha em ~1 minuto.
- **Sem GitHub:** rode `npx vercel --prod` na pasta do projeto.

## 6. Rodando no seu computador (opcional)

```bash
npm install     # só na primeira vez
npm run dev     # abre em http://localhost:3000
```

Sem banco configurado, os leads de teste ficam no arquivo `.data/leads.json`.

## 7. Publicação na Vercel (primeira vez)

1. Crie conta gratuita em [vercel.com](https://vercel.com) (pode entrar com GitHub).
2. Suba esta pasta para um repositório no GitHub (ou use `npx vercel` direto do terminal).
3. Na Vercel: **Add New → Project → importe o repositório**. Ela detecta Next.js sozinha — não mude nada e clique em **Deploy**.
4. Banco de leads: no projeto da Vercel, aba **Storage → Create Database → Neon (Postgres)** → conectar ao projeto. A variável `DATABASE_URL` é criada automaticamente.
5. Senha do admin: **Settings → Environment Variables** → adicione `ADMIN_PASSWORD` com a senha que você quiser → **Redeploy**.
6. Domínio próprio (ex.: `wmassessoria.com.br`): **Settings → Domains** → siga as instruções de DNS.
7. Depois de ter o domínio final, atualize o campo `empresa.url` em `content/site.ts` (usado pelo Google/SEO).

---

**Qualquer dúvida:** abra este projeto no Claude Code e peça a alteração em português. 😉
