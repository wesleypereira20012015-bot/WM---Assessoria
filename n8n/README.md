# Fluxos do n8n

Três workflows prontos para importar no n8n cloud: **Workflows → Import from File**.

| Arquivo | Quando roda | O que faz |
| --- | --- | --- |
| `coleta.json` | Todo dia às 3h | Puxa os posts dos concorrentes pela Apify, calcula o engajamento e grava em `referencias`. |
| `pauta.json` | Segunda às 9h | Lê referências, ideias e histórico, pede as 4 publicações da semana ao Claude, gera a arte e deixa tudo esperando sua aprovação. |
| `publicacao.json` | De hora em hora | Publica no Instagram o que você aprovou e cuja hora já chegou. |

## Antes de ativar: as quatro credenciais

O n8n guarda as chaves; os arquivos JSON não contêm nenhuma. Crie em
**Credentials → Add credential**:

| Credencial | Tipo | Como preencher |
| --- | --- | --- |
| Supabase | Supabase API | Host do projeto e a **service role key**. |
| Anthropic | Anthropic API | Sua `ANTHROPIC_API_KEY`. |
| `Apify Bearer` | Header Auth | Nome `Authorization`, valor `Bearer SEU_APIFY_TOKEN`. |
| `Instagram Bearer` | Header Auth | Nome `Authorization`, valor `Bearer SEU_IG_ACCESS_TOKEN`. |
| `Supabase Service Role Bearer` | Header Auth | Nome `Authorization`, valor `Bearer SUA_SERVICE_ROLE_KEY`. |

As três últimas são do mesmo tipo (Header Auth), então dê exatamente esses nomes
para não trocar uma pela outra.

## Depois de importar: o nó Config

Cada workflow começa com um nó **Config**. É o único lugar que você edita:

- `supabase_url` — `https://SEU-PROJETO.supabase.co`, nos três fluxos.
- `perfis` — em `coleta.json`, os perfis concorrentes sem o `@`.
- `ig_user_id` — em `publicacao.json`, o ID da conta profissional.
- `graph_version` — em `publicacao.json`, a versão da API do Facebook.

## Como o dinheiro é economizado

O custo que se repete todo mês está na chamada ao Claude, então:

- O `pauta` manda só as **10 melhores referências** da semana, com a legenda
  cortada em **400 caracteres**. Nunca o dump da Apify inteiro.
- **Uma única chamada** gera as 4 publicações, não uma por publicação.
- O bloco fixo de identidade da marca vai no começo do prompt com
  **cache ligado**, porque se repete em toda chamada.
- A classificação de tema, que é trabalho mecânico, roda no
  **`claude-haiku-4-5`**. O **`claude-sonnet-4-6`** só é usado para escrever.
- Os prompts pedem **JSON puro**, sem texto de enfeite antes ou depois.

## As travas que impedem estrago

- **Nada é publicado sem aprovação.** O `publicacao` só pega status `agendada`,
  e o banco recusa `agendada` sem `aprovada_em` preenchido. Mesmo que alguém
  mexa no workflow, o banco não deixa passar.
- **Nada é publicado pela metade.** Se qualquer prancha falhar ao virar
  container no Instagram, a publicação vira `erro` em vez de sair sem uma
  imagem.
- **Sem retry infinito.** Os nós do Instagram têm retry desligado. Falhou, vira
  `erro` com o motivo salvo em `erro_detalhe`, que aparece no calendário da
  Área do Criador. Na hora seguinte ela não é mais pega, porque saiu de
  `agendada`.
- **Recoleta não duplica.** `referencias.url` é único e o insert usa
  `resolution=ignore-duplicates`.
- **Arte pela metade não vai para aprovação.** A publicação só sai de
  `rascunho` depois que todas as pranchas foram renderizadas.

## Testar antes de deixar solto

Rode cada um na mão, em ordem, com **Execute Workflow**:

1. `coleta` — confira que apareceram linhas em `referencias`, sem repetição.
2. `pauta` — confira que apareceram publicações em `aguardando_aprovacao`, com
   arte, na aba Aprovação. Se a arte não veio, olhe os logs da Edge Function
   `render-card`: quase sempre é `PEXELS_API_KEY` faltando.
3. `publicacao` — **teste primeiro com uma publicação de teste**, não com a
   pauta real. O passo a passo está em `../docs/publicacao-instagram.md`.
