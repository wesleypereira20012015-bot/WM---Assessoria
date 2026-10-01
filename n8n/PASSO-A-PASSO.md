# Passo a passo — do zero até os disparos rodando

Guia para seguir sem saber mexer em servidor. Cada comando é para copiar
e colar inteiro. Se algo der errado, pule para **[Se travar](#se-travar)**
no fim.

O `README.md` deste diretório é a versão técnica, para consultar depois.

---

## Antes de começar: o mapa

São 4 etapas independentes. **A Parte 1 não precisa de servidor nenhum** e
já conserta o formulário do site, que hoje está quebrado. Comece por ela.

| Parte | O que faz | Tempo | Custo |
|---|---|---|---|
| 1 | Arruma o banco de dados | ~10 min | R$ 0 |
| 2 | Contrata e prepara o servidor | ~40 min | ~R$ 30–60/mês |
| 3 | Cadastra as credenciais | ~40 min | R$ 0 |
| 4 | Testa e solta | ~30 min | R$ 0 |

Você vai precisar ter em mãos:

- Acesso ao **Supabase** (o banco): já tem.
- Acesso à **Z-API** (o WhatsApp): já tem.
- Um **cartão de crédito** para o servidor.
- Um **domínio**. Você já tem o do site; vamos criar um subdomínio nele.
- Uma **chave da Anthropic** (a Ana usa o Claude). Se não tiver, crio no
  caminho.

---

# PARTE 1 — Arrumar o banco (sem servidor)

Duas coisas de uma vez: cria a tabela que falta para o formulário do site
voltar a funcionar, e cria as tabelas da automação.

### 1.1 Abra o SQL Editor do Supabase

👉 **https://supabase.com/dashboard/project/wlpvaasjvtqtdtlkoxvy/sql/new**

Isso abre uma caixa de texto onde você cola comandos e clica em **Run**.

### 1.2 Primeiro arquivo — a tabela do site

Abra este link, clique no botão **Copy raw file** (ícone de cópia, canto
superior direito do código):

👉 **[0001_public_leads.sql](https://github.com/wesleypereira20012015-bot/WM---Assessoria/blob/main-5lvhvn/supabase/migrations/0001_public_leads.sql)**

Cole no SQL Editor e clique em **Run** (ou `Ctrl+Enter`).

Deve aparecer **Success. No rows returned**. É isso — é o resultado certo
para um comando que cria tabela.

### 1.3 Segundo arquivo — as tabelas da automação

Mesma coisa com:

👉 **[0002_schema_disparo.sql](https://github.com/wesleypereira20012015-bot/WM---Assessoria/blob/main-5lvhvn/supabase/migrations/0002_schema_disparo.sql)**

Cole numa aba nova do SQL Editor, **Run**.

### 1.4 Confira

Cole e rode:

```sql
select table_schema, table_name from information_schema.tables
where table_schema in ('public','disparo') order by 1,2;
```

Você deve ver 5 linhas: `disparo.config`, `disparo.leads`,
`disparo.log_ingestao`, `disparo.mensagens` e `public.leads`.

Se viu as 5, **o formulário do site já voltou a funcionar**. Vale testar:
entre no site, preencha a calculadora e veja se o lead aparece em
👉 **[Table Editor → leads](https://supabase.com/dashboard/project/wlpvaasjvtqtdtlkoxvy/editor)**

> Rodar esses arquivos duas vezes não faz mal nenhum — eles checam o que
> já existe antes de criar. Se ficou na dúvida se rodou, rode de novo.

---

# PARTE 2 — O servidor

## 2.1 Contratar

Precisa de um **VPS com Ubuntu 24.04**. Qualquer um destes serve; o mais
barato de cada um dá conta:

| Onde | Observação |
|---|---|
| 👉 [Hostinger VPS](https://www.hostinger.com.br/servidor-vps) | painel em português, suporte em português — **recomendo para começar** |
| 👉 [Hetzner](https://www.hetzner.com/cloud) | o mais barato, mas painel em inglês e servidor na Europa (uns 200ms mais lento) |
| 👉 [DigitalOcean](https://www.digitalocean.com/pricing/droplets) | inglês, servidor nos EUA, documentação muito boa |

Preços mudam, mas o plano de entrada costuma ficar entre R$ 30 e R$ 60
por mês. **Pegue o menor com pelo menos 2 GB de RAM.**

Ao contratar, escolha:

- **Sistema operacional:** Ubuntu 24.04 LTS
- **Localização:** Brasil ou EUA (mais perto = mais rápido)
- **Autenticação:** senha de root serve. Se oferecerem chave SSH e você
  não souber o que é, use senha.

No fim você recebe por e-mail: um **endereço IP** (tipo `203.0.113.45`) e
uma **senha de root**. Guarde os dois.

## 2.2 Apontar o subdomínio

Vamos usar `n8n.wmassessoria.com.br` (troque pelo seu domínio real).

Entre no painel onde você registrou o domínio (Registro.br, GoDaddy,
Hostinger, Cloudflare — onde for) e procure **DNS** ou **Zona DNS**.
Adicione um registro:

| Campo | Valor |
|---|---|
| Tipo | `A` |
| Nome / Host | `n8n` |
| Valor / Aponta para | o **IP do servidor** |
| TTL | deixe o padrão |

> **Faça isso agora, antes de continuar.** O certificado de segurança é
> emitido automaticamente na primeira subida, e ele só funciona se o
> domínio já estiver apontando. O DNS leva de 5 minutos a algumas horas
> para propagar.

Para saber se já propagou, use:
👉 **https://dnschecker.org** (digite `n8n.seudominio.com.br`, tipo A)

Quando a maioria dos pontos mostrar o seu IP, siga.

## 2.3 Entrar no servidor

No seu computador, abra o terminal:

- **Windows:** tecla Windows, digite `powershell`, Enter
- **Mac:** `Cmd+Espaço`, digite `terminal`, Enter

Cole, trocando pelo seu IP:

```bash
ssh root@203.0.113.45
```

Na primeira vez ele pergunta algo sobre *fingerprint* — digite `yes`.
Depois pede a senha de root. **A senha não aparece na tela enquanto você
digita** — isso é normal, digite e dê Enter.

Deu certo se o texto antes do cursor mudou para algo como
`root@servidor:~#`. **Daqui para frente, todo comando é colado aqui.**

## 2.4 Instalar o Docker

Um comando:

```bash
curl -fsSL https://get.docker.com | sh
```

Demora uns 2 minutos e cospe bastante texto. Confira:

```bash
docker --version && docker compose version
```

Se apareceram duas versões, está instalado.

## 2.5 Liberar o firewall

```bash
ufw allow 22 && ufw allow 80 && ufw allow 443 && ufw --force enable
```

As portas 80 e 443 são o site; a 22 é o seu acesso — **não esqueça dela**
ou você se tranca fora do servidor.

## 2.6 Baixar os arquivos

Os arquivos de configuração estão no seu repositório, que é privado.
Precisa de uma senha de acesso (*token*) para baixar.

**Crie o token:**

👉 **https://github.com/settings/tokens/new**

Preencha:
- **Note:** `vps-n8n`
- **Expiration:** 90 days
- **Marque a caixa `repo`** (a primeira, que libera os repositórios)
- Desça e clique em **Generate token**

Copie o código que aparece (começa com `ghp_`). **Ele só aparece uma
vez** — cole num lugar seguro agora.

**Baixe, no servidor:**

```bash
apt install -y git
git clone https://github.com/wesleypereira20012015-bot/WM---Assessoria.git
```

Ele vai pedir:
- **Username:** `wesleypereira20012015-bot`
- **Password:** cole o token `ghp_...` (não a senha do GitHub)

Depois:

```bash
cd WM---Assessoria/n8n && git checkout main-5lvhvn && ls
```

Você deve ver `Caddyfile`, `docker-compose.yml`, `README.md`, entre outros.

## 2.7 Caminho curto: deixar o script fazer o resto

Daqui para frente há um atalho. O arquivo `instalar.sh` faz os passos 2.4
a 2.8 sozinho: instala o Docker, libera o firewall, faz 5 perguntas, gera
as senhas, confere o DNS e sobe tudo.

```bash
bash instalar.sh
```

Ele pergunta o subdomínio, o e-mail, os dois dados da Z-API e o WhatsApp
que recebe os leads. As senhas do sistema ele gera sozinho — você não
precisa inventar nem digitar nenhuma.

**Se o DNS ainda não estiver apontando, ele avisa e para** em vez de
queimar a tentativa de certificado. Pode rodar de novo quantas vezes
quiser: ele detecta o que já está feito e não sobrescreve um `.env`
existente sem perguntar.

Quando terminar, ele mostra o endereço para abrir no navegador. **Pule
para a [Parte 3](#parte-3--credenciais).**

> O script exibe a `N8N_ENCRYPTION_KEY` uma vez, em destaque, e espera
> você confirmar que copiou. É a única chance — depois ela fica só dentro
> do `.env` no servidor.

Se preferir fazer à mão, ou se o script falhar, continue abaixo.

## 2.7b Preencher as configurações (manual)

Gere as duas senhas do sistema:

```bash
echo "N8N_ENCRYPTION_KEY=$(openssl rand -hex 32)"
echo "POSTGRES_PASSWORD=$(openssl rand -base64 24)"
```

Copie as duas linhas que apareceram para um arquivo de texto no seu
computador. A `N8N_ENCRYPTION_KEY` é a mais importante do sistema: **ela
destranca todas as credenciais salvas.** Se você perder, é recadastrar
tudo de novo, inclusive o acesso ao Gmail.

Crie o arquivo de configuração:

```bash
cp .env.example .env && nano .env
```

Abre um editor de texto dentro do terminal. Preencha:

```
N8N_HOST=n8n.wmassessoria.com.br        ← seu subdomínio
ACME_EMAIL=wesleypereira20012015@gmail.com
POSTGRES_PASSWORD=                       ← cole a que você gerou
N8N_ENCRYPTION_KEY=                      ← cole a que você gerou
ZAPI_INSTANCE=                           ← Z-API, próximo passo
ZAPI_TOKEN=                              ← Z-API, próximo passo
CANAL_NOTIFICACAO=5519997108907          ← quem recebe os leads prontos
NUMERO_2=5519997108907
```

Os dois da Z-API estão em
👉 **https://app.z-api.io** → sua instância → **ID da instância** e
**Token** (não o *Client-Token*, esse vem depois).

Para salvar no `nano`: `Ctrl+O`, Enter, depois `Ctrl+X`.

> **Não preencha os dois campos da Z-API pela metade.** O sistema se
> recusa a subir sem eles de propósito — é melhor falhar na hora do que
> você descobrir dias depois que nenhuma mensagem saiu.

## 2.8 Subir

```bash
docker compose up -d
```

A primeira vez baixa uns 2 GB, leva uns 5 minutos. Acompanhe o
certificado sendo emitido:

```bash
docker compose logs -f caddy
```

Quando aparecer `certificate obtained successfully`, saia com `Ctrl+C`.

**Abra no navegador:** `https://n8n.seudominio.com.br`

Deve aparecer a tela de criar conta do n8n, com o cadeado de segurança na
barra de endereço. Crie sua conta de administrador — **use uma senha
forte**, porque esse endereço fica aberto na internet.

🎉 Se chegou aqui, o servidor está pronto.

---

# PARTE 3 — Credenciais

Agora são 4 credenciais dentro do n8n. No menu lateral:
**Credentials → Add credential**.

## 3.1 Supabase (o banco)

Escolha o tipo **Postgres**.

Pegue os dados em
👉 **https://supabase.com/dashboard/project/wlpvaasjvtqtdtlkoxvy/settings/database**

Procure **Connection string → Session pooler** e use aqueles valores:

| Campo no n8n | Onde achar |
|---|---|
| Host | o `aws-0-...pooler.supabase.com` |
| Database | `postgres` |
| User | algo como `postgres.wlpvaasjvtqtdtlkoxvy` |
| Password | a senha do banco (se esqueceu, **Reset database password** na mesma página) |
| Port | `5432` |
| SSL | ligado |

Clique em **Save** — o n8n testa a conexão e mostra ✅ se deu certo.

> Use o **Session pooler**, não a conexão direta. A direta costuma ser
> bloqueada em servidor sem IPv6.

## 3.2 Z-API (o WhatsApp)

Tipo: **Header Auth**.

| Campo | Valor |
|---|---|
| Name | `Client-Token` |
| Value | o **Client-Token** da Z-API |

O Client-Token está em 👉 **https://app.z-api.io** → sua instância →
**Segurança** (ou *Security*). É diferente do Token que você já usou no
`.env`.

## 3.3 Anthropic (o cérebro da Ana)

Tipo: **Anthropic**.

Pegue a chave em 👉 **https://console.anthropic.com/settings/keys** →
**Create Key**. Copie e cole no n8n.

Precisa ter crédito na conta. Uma conversa da Ana custa centavos, mas com
saldo zero ela não responde.

## 3.4 Gmail (ler os relatórios)

Essa é a mais chata — são uns 10 minutos no painel do Google. Tipo:
**Gmail OAuth2**.

**Antes de começar, copie do n8n o endereço de retorno** que ele mostra
na tela da credencial. É algo como:

```
https://n8n.seudominio.com.br/rest/oauth2-credential/callback
```

Agora, no Google:

1. 👉 **https://console.cloud.google.com/projectcreate** — crie um
   projeto chamado `wm-n8n`.
2. 👉 **https://console.cloud.google.com/apis/library/gmail.googleapis.com**
   — clique em **Ativar**.
3. 👉 **https://console.cloud.google.com/apis/credentials/consent** —
   configure a tela de consentimento: tipo **Externo**, nome do app
   `WM n8n`, seu e-mail nos campos de contato. Salve.
   - Em **Usuários de teste**, **adicione o e-mail que recebe os
     relatórios**. Sem isso o Google recusa o acesso.
4. 👉 **https://console.cloud.google.com/apis/credentials** → **Criar
   credenciais → ID do cliente OAuth**:
   - Tipo: **Aplicativo da Web**
   - Em **URIs de redirecionamento autorizados**, clique em
     **Adicionar URI** e cole **exatamente** o endereço que você copiou
     do n8n
   - **Criar**
5. Copie o **ID do cliente** e a **Chave secreta** para a credencial no
   n8n e clique em **Sign in with Google**. Autorize com a conta que
   recebe os relatórios.

> Se o Google reclamar de `redirect_uri_mismatch`, o endereço colado no
> passo 4 está diferente do que o n8n mostra. Tem de ser idêntico,
> inclusive o `https://` e sem barra sobrando no fim.

---

# PARTE 4 — Fluxos, teste e liberação

## 4.1 Importar os fluxos

Baixe os dois arquivos no **seu computador** (botão **Download raw
file**):

👉 **[fluxo-a-ingestao-disparo.json](https://github.com/wesleypereira20012015-bot/WM---Assessoria/blob/main-5lvhvn/n8n/workflows/fluxo-a-ingestao-disparo.json)** — o dos disparos
👉 **[fluxo-b-ana.json](https://github.com/wesleypereira20012015-bot/WM---Assessoria/blob/main-5lvhvn/n8n/workflows/fluxo-b-ana.json)** — o atendimento da Ana

No n8n: **Workflows → ⋯ → Import from File**, um por vez.

**Agora o passo que todo mundo esquece:** abra cada fluxo e clique nos nós
que precisam de credencial, escolhendo a que você acabou de criar. O
vínculo não vem dentro do arquivo.

- Nós roxos de banco (**Postgres**) → credencial do Supabase
- Nós de **HTTP Request** → credencial Header Auth da Z-API
- Nó do **Gmail** → credencial do Gmail
- Nó **Claude Sonnet** → credencial da Anthropic

Um nó com credencial faltando aparece com um triângulo de aviso.

## 4.2 Apontar o webhook da Z-API

Em 👉 **https://app.z-api.io** → sua instância → **Webhooks** → **Ao
receber mensagem**, cole:

```
https://n8n.seudominio.com.br/webhook/zapi-ana
```

Isso é o que faz as respostas dos leads chegarem na Ana.

## 4.3 Ative os dois fluxos

Abra cada um e ligue a chavinha **Active** (canto superior direito). Sem
isso nada roda sozinho.

## 4.4 Teste sem risco

O sistema já vem em **modo de teste**: nenhuma mensagem vai para lead
real. Tudo é desviado para um número seu, com o telefone verdadeiro
escrito no corpo da mensagem.

Confirme qual é o número de teste no SQL Editor do Supabase:

```sql
select chave, valor from disparo.config
where chave in ('TEST_MODE','NUMERO_TESTE');
```

`TEST_MODE` tem de estar `true`. Se quiser receber no seu celular, troque:

```sql
update disparo.config set valor = '5519999999999' where chave = 'NUMERO_TESTE';
```

Agora, no n8n, abra o **Fluxo A** e clique em **Execute Workflow**.

O que deve acontecer:
1. Ele lê o último relatório no Gmail
2. Extrai os contatos do PDF
3. Grava no banco
4. Manda as mensagens **para o seu número**, marcadas com `[TESTE]`

Responda uma dessas mensagens como se fosse o lead. A Ana deve responder
em segundos — é o Fluxo B funcionando.

Confira o que entrou no banco:

```sql
select telefone, nome, cidade, status from disparo.leads order by criado_em desc limit 20;
```

## 4.5 Soltar de verdade

Só depois que o teste acima funcionou inteiro:

```sql
update disparo.config set valor = 'false' where chave = 'TEST_MODE';
```

A partir daí o Fluxo A dispara a cada 30 minutos, das 9h às 19h,
respeitando o aquecimento do chip: 20 mensagens no primeiro dia, subindo
15 por dia até o teto de 90.

Esses números são ajustáveis sem mexer em nada do sistema:

```sql
select chave, valor, descricao from disparo.config order by chave;
update disparo.config set valor = '30' where chave = 'MAX_DIA_INICIAL';
```

---

# Se travar

| O que você vê | O que é |
|---|---|
| `ssh: connect to host ... timed out` | IP errado, ou o servidor ainda está ligando (espere 2 min) |
| Navegador diz "não é seguro" / não abre | DNS ainda não propagou. Confira em [dnschecker.org](https://dnschecker.org) e espere |
| `certificate obtained` não aparece | DNS não aponta para o servidor, ou a porta 80 está fechada (passo 2.5) |
| `required variable ZAPI_INSTANCE is missing` | falta preencher o `.env` (passo 2.7) — é proteção, não defeito |
| Fluxo fica verde mas nenhuma mensagem chega | `ZAPI_INSTANCE`/`ZAPI_TOKEN` errados no `.env`. Corrija e rode `docker compose up -d` de novo |
| Fluxo A roda e não envia nada | fora do horário de 9h–19h, ou o teto do dia já foi atingido. Normal |
| Resposta do lead não chega na Ana | webhook errado na Z-API (4.2), ou Fluxo B desativado (4.3) |
| `redirect_uri_mismatch` no Google | o endereço de retorno tem de ser idêntico ao que o n8n mostra |

Comandos úteis no servidor:

```bash
cd ~/WM---Assessoria/n8n

docker compose ps          # o que está rodando
docker compose logs -f n8n # ver o que o n8n está fazendo (Ctrl+C sai)
docker compose restart     # reiniciar tudo
docker compose up -d       # aplicar mudanças do .env
```

## Duas coisas para não perder

1. **A `N8N_ENCRYPTION_KEY`.** Sem ela, um backup do servidor não serve
   para nada: as credenciais ficam ilegíveis. Guarde fora do servidor.
2. **Os leads.** Estão no Supabase, não no servidor — de propósito.
   Perder o VPS não faz você perder os leads.

Se mudar algum fluxo pelo editor do n8n, exporte (**⋯ → Download**) e me
mande para eu atualizar no repositório. Senão o que está versionado vai
ficando velho — foi exatamente assim que os arquivos quase se perderam
quando o n8n Cloud expirou.
