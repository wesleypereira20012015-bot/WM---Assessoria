# n8n self-hospedado — automação de disparo

Migração da instância n8n Cloud (suspensa) para um servidor próprio.
Troca os ~R$150/mês do Cloud pelo custo de um VPS pequeno.

## O que tem aqui

| Arquivo | Para que serve |
|---|---|
| `docker-compose.yml` | n8n + Postgres (estado) + Caddy (HTTPS) |
| `Caddyfile` | proxy reverso com certificado automático |
| `.env.example` | modelo das variáveis; copie para `.env` |
| `workflows/fluxo-a-ingestao-disparo.json` | ingestão do relatório e disparo (19 nós) |
| `workflows/fluxo-b-ana.json` | atendimento e qualificação pela Ana (21 nós) |

O schema do banco fica em `../supabase/migrations/`.

## Antes de começar

Você vai precisar de:

- **Um VPS** com Docker. 2 vCPU e 4 GB dão folga; 1 vCPU e 2 GB rodam.
- **Um subdomínio** (ex.: `n8n.wmassessoria.com.br`) com registro A
  apontando para o IP do VPS. **Configure o DNS antes de subir** — o
  certificado é emitido na primeira subida e falha se o domínio ainda
  não resolver.
- **Portas 80 e 443 abertas.** A 80 é usada pela validação do
  Let's Encrypt, não só para redirecionar.

### Por que HTTPS é obrigatório aqui

O Fluxo B recebe as respostas do WhatsApp por webhook da Z-API, e a Z-API
só entrega em endpoint público com certificado válido. Sem isso o Fluxo A
até dispara, mas nenhuma resposta chega — a Ana nunca atende.

## Subida

### 1. Configurar

```bash
cd n8n
cp .env.example .env
openssl rand -hex 32     # N8N_ENCRYPTION_KEY
openssl rand -base64 24  # POSTGRES_PASSWORD
```

Preencha o `.env`. **Guarde a `N8N_ENCRYPTION_KEY` fora do servidor**: ela
descriptografa todas as credenciais salvas. Se mudar ou se perder, é
recadastrar tudo, inclusive o OAuth do Gmail.

### 2. Subir

```bash
docker compose up -d
docker compose logs -f caddy   # acompanhe a emissão do certificado
```

Acesse `https://SEU-DOMINIO` e crie a conta de administrador na primeira
tela. Essa conta é a dona da instância — use uma senha forte, porque o
editor fica exposto na internet.

### 3. Aplicar o schema no Supabase

Uma vez, pelo SQL Editor do Supabase (ou `supabase db push`):

```
supabase/migrations/0001_public_leads.sql    -> tabela de leads do site
supabase/migrations/0002_schema_disparo.sql  -> schema disparo (automação)
```

São idempotentes: rodar de novo não duplica nada.

### 4. Cadastrar as credenciais

Em **Credentials → Add credential**. O `.env` cobre só o que os nós Code
leem; as credenciais dos nós ficam aqui:

| Credencial | Tipo | Onde usar |
|---|---|---|
| Gmail | *Gmail OAuth2* | nó `Gmail: Relatorio Guia da Construcao` |
| Supabase | *Postgres* | todos os nós Postgres |
| Z-API | *Header Auth* | os 4 nós HTTP Request |
| Anthropic | *Anthropic* | nó `Claude Sonnet 4.6` |

Detalhes que costumam travar:

- **Gmail OAuth2** — no Google Cloud Console, a *Authorized redirect URI*
  tem de ser exatamente
  `https://SEU-DOMINIO/rest/oauth2-credential/callback`.
  Era outra no Cloud; precisa ser atualizada.
- **Postgres** — use a string de conexão do Supabase em
  *Connect → Connection string*, com **Session pooler** (porta 5432) e
  SSL habilitado. Os workflows escrevem só no schema `disparo`.
- **Header Auth** — nome: `Client-Token`, valor: o Client-Token da
  Z-API. É o único lugar onde esse token entra; não vai no `.env`.

### 5. Importar os workflows

**Workflows → Import from File**, um arquivo por vez, a partir de
`workflows/`. Depois de importar, abra cada nó que usa credencial e
selecione a credencial correspondente — o vínculo não vem no JSON.

### 6. Apontar o webhook da Z-API

No painel da Z-API, em *Webhooks → Ao receber mensagem*:

```
https://SEU-DOMINIO/webhook/zapi-ana
```

O caminho `zapi-ana` está definido no nó Webhook do Fluxo B. Enquanto o
workflow estiver desativado, use a URL com `/webhook-test/` para testar
pelo editor.

### 7. Testar antes de soltar

`disparo.config` já vem com `TEST_MODE = true`, e **nada vai para lead
real** nesse modo: todo envio é desviado para `NUMERO_TESTE`, com o
telefone verdadeiro no corpo da mensagem.

```sql
-- confira e ajuste o número de teste para o SEU aparelho
select chave, valor from disparo.config where chave in ('TEST_MODE','NUMERO_TESTE');
update disparo.config set valor = '55SEUNUMERO' where chave = 'NUMERO_TESTE';
```

Rode o Fluxo A manualmente (*Execute Workflow*), confira as mensagens que
chegaram ao seu aparelho, responda a uma delas e veja a Ana atender.
Só então:

```sql
update disparo.config set valor = 'false' where chave = 'TEST_MODE';
```

Ative os dois workflows (toggle *Active*) — sem isso o agendamento e o
webhook não rodam sozinhos.

## Diferenças em relação à instância Cloud

O que mudou na migração, e por quê:

- **`$vars` → `$env`.** Os 4 nós de envio liam a instância e o token da
  Z-API das *Variables* do n8n. Variables são recurso licenciado e não
  existem na Community: resolveriam para `undefined`, a URL sairia como
  `.../instances/undefined/token/undefined/send-text` e **todo envio
  falharia em silêncio**, porque os nós usam `neverError`. Agora vêm do
  ambiente do container (`N8N_BLOCK_ENV_ACCESS_IN_NODE=false`).
- **Redirect URI do Gmail** muda junto com o domínio (ver passo 4).
- **Fuso horário** fixado em `America/Sao_Paulo` no compose. A saudação
  por horário e a janela de disparo dependem disso; em UTC o fluxo
  mandaria "bom dia" às 21h e disparia fora da janela.

## Operação

```bash
docker compose logs -f n8n      # acompanhar
docker compose pull && docker compose up -d   # atualizar
docker compose down             # parar (os volumes ficam)
```

O compose usa a tag `:latest`. Depois da primeira subida bem-sucedida,
**fixe a versão** para não acordar com um upgrade inesperado:

```bash
docker compose exec n8n n8n --version   # veja a versão que está rodando
# troque no docker-compose.yml: docker.n8n.io/n8nio/n8n:2.XX.X
```

A série atual é a **2.x** (validado com a 2.40.7). Se `docker.n8n.io`
estiver inacessível na sua rede, o espelho oficial no Docker Hub serve:
`n8nio/n8n:2.XX.X`.

### Backup

Três coisas, em lugares diferentes:

1. **Workflows** — já versionados em `workflows/`. Reexporte e commite a
   cada mudança feita pelo editor, senão o repositório fica defasado e o
   histórico perde o sentido.
2. **Credenciais** — o volume `n8n_data` e a `N8N_ENCRYPTION_KEY`. Um sem
   o outro não serve para nada.
3. **Leads** — ficam no Supabase, não neste servidor. É de propósito:
   perder o VPS não pode significar perder os leads.

```bash
# banco de estado do n8n
docker compose exec -T postgres pg_dump -U n8n n8n | gzip > n8n-estado.sql.gz
```

## Quando algo não funciona

| Sintoma | Causa provável |
|---|---|
| n8n reinicia sem parar, com `n8n's address '::' is not available` | falta `N8N_LISTEN_ADDRESS=0.0.0.0` — o n8n 2.x tenta IPv6, que a rede do Docker não tem. Já está no compose |
| Certificado não emite | DNS ainda não aponta para o VPS, ou porta 80 fechada |
| Editor fica "carregando" | WebSocket barrado — confira o `reverse_proxy` do Caddyfile |
| Fluxo A roda e não envia nada | fora da janela `JANELA_INICIO`–`JANELA_FIM` (hora de SP), ou teto `MAX_HORA`/`MAX_DIA` atingido |
| Envio "bem-sucedido" sem mensagem | `ZAPI_INSTANCE`/`ZAPI_TOKEN` vazios. Os nós usam `neverError`, então o erro não aparece — veja a resposta HTTP na execução |
| Webhook não chega | URL na Z-API errada, ou Fluxo B desativado (`/webhook/` só vale com o workflow ativo) |
| Credenciais "quebradas" após restaurar | `N8N_ENCRYPTION_KEY` diferente da original |

Fora da janela de disparo o Fluxo A encerra sem enviar e registra
`fora da janela de disparo (Xh SP)` no log da execução — é comportamento
esperado, não falha.
