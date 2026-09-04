# Publicar no Instagram: como testar antes de soltar

Este é o último passo a ligar, e o único que faz algo irreversível: um post
publicado é público. Por isso o teste é feito com uma **publicação de teste**,
não com a pauta real.

## 1. O que precisa estar pronto antes

- A conta do Instagram precisa ser **Profissional** (Comercial ou Criador) e
  estar **vinculada a uma Página do Facebook**. Conta pessoal não publica por
  API, de jeito nenhum.
- Um app no [developers.facebook.com](https://developers.facebook.com) com o
  produto **Instagram Graph API**.
- Um **token de longa duração** com as permissões `instagram_basic`,
  `instagram_content_publish`, `pages_show_list` e `pages_read_engagement`.
- O `IG_USER_ID`, que **não** é o `@` do perfil. Pegue assim:

```bash
curl -s "https://graph.facebook.com/v21.0/me/accounts?access_token=SEU_TOKEN"
# pegue o id da Página, depois:
curl -s "https://graph.facebook.com/v21.0/ID_DA_PAGINA?fields=instagram_business_account&access_token=SEU_TOKEN"
```

Confira a validade e as permissões do token antes de continuar:

```bash
curl -s "https://graph.facebook.com/v21.0/debug_token?input_token=SEU_TOKEN&access_token=SEU_TOKEN"
```

Olhe `expires_at` e `scopes`. Token de curta duração vence em horas e o fluxo
passa a falhar sozinho no meio da semana.

## 2. Confirme que a imagem abre em HTTPS público

O Instagram **baixa a imagem pela URL**. Se ela não abrir direto, sem
redirecionamento e sem token, a publicação falha com uma mensagem que não
explica nada. Teste antes:

```bash
# troque pela url_publica de um asset já renderizado
curl -sI "https://SEU-PROJETO.supabase.co/storage/v1/object/public/publicacoes/<id>/1.jpg"
```

Você tem que ver `HTTP/2 200` e `content-type: image/jpeg`. Se vier `301`,
`302` ou `400`, pare aqui: o problema é o Storage, não o Instagram.

## 3. Crie uma publicação de teste

No **SQL Editor** do Supabase. Ela nasce já aprovada e agendada para o passado,
para o fluxo pegá-la na próxima execução:

```sql
-- Reaproveita a arte de uma publicação que já foi renderizada.
-- Troque PUBLICACAO_COM_ARTE pelo id de uma que já tenha assets.
with origem as (
  select id from public.publicacoes
  where id = 'PUBLICACAO_COM_ARTE'
),
nova as (
  insert into public.publicacoes
    (formato, titulo_interno, legenda, hashtags, status, cards,
     aprovada_em, agendada_para)
  select 'carrossel',
         '[TESTE] nao divulgar',
         'Publicacao de teste da integracao. Sera apagada.',
         array['#teste'],
         'agendada',
         cards,
         now(),
         now() - interval '1 minute'
  from public.publicacoes where id = (select id from origem)
  returning id
)
insert into public.assets
  (publicacao_id, ordem, url_publica, fonte_foto, credito_fotografo, url_original_foto)
select (select id from nova), ordem, url_publica, fonte_foto, credito_fotografo, url_original_foto
from public.assets where publicacao_id = (select id from origem);
```

Se você ainda não tem nenhuma publicação com arte, rode antes o workflow
`pauta` e aprove uma pela Área do Criador.

## 4. Rode o fluxo na mão

No n8n, abra `WM · Publicação no Instagram` e clique em **Execute Workflow**.
Não ative o agendamento ainda.

Acompanhe nó a nó:

1. `Supabase: agendadas que já venceram` tem que trazer a sua publicação de teste.
2. `Instagram: container da imagem` devolve um `id` por prancha.
3. `Instagram: container do carrossel` devolve um `id`.
4. `Instagram: publicar` devolve o `ig_media_id`.
5. `Supabase: marcar publicada` grava o id e a data.

## 5. Confira e limpe

Veja o post no perfil. Depois apague:

```sql
-- apaga o post do Instagram pelo app? Não dá: apague pelo aplicativo.
delete from public.publicacoes where titulo_interno like '[TESTE]%';
```

Apagar a linha remove os `assets` junto (cascata). O post em si você apaga
pelo aplicativo do Instagram, na mão.

## 6. Só então ative o agendamento

Com o teste passando, ative o workflow. Ele passa a rodar de hora em hora e
só pega o que **você** aprovou.

## Quando der errado

O motivo fica salvo em `publicacoes.erro_detalhe` e aparece na aba Calendário
da Área do Criador. Os mais comuns:

| Mensagem do Instagram | O que é de verdade |
| --- | --- |
| `The image URL is not accessible` | O Storage não está servindo a imagem publicamente. Volte ao passo 2. |
| `Media type not supported` | O arquivo não é JPEG. O bucket só aceita `image/jpeg`, então isso indica que alguém mudou o renderizador. |
| `Invalid OAuth access token` | Token vencido ou revogado. Gere outro de longa duração. |
| `(#200) Permission denied` | Falta `instagram_content_publish` no token. |
| `Application request limit reached` | Limite da API. O Instagram permite 25 posts por 24h; nossa meta é 4 por semana, então isso quase sempre é loop de teste. |
| `The carousel must have between 2 and 10 items` | Não deveria chegar aqui: o banco e o fluxo já barram antes. Se aconteceu, alguém mexeu nas travas. |

Publicação que virou `erro` **não é tentada de novo sozinha**, de propósito.
Para reprocessar, conserte a causa e volte o status para `agendada` com uma
data nova. O banco vai exigir que `aprovada_em` continue preenchido, então a
aprovação original é preservada.
