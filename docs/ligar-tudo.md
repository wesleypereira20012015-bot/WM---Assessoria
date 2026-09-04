# Ligar tudo: o que só você pode fazer

As chaves de API são secretas e não existem neste repositório nem no ambiente
onde o código foi escrito. Ninguém além de você consegue obtê-las. Este é o
caminho mais curto, na ordem certa.

Regra que vale para tudo abaixo: **nenhuma chave entra em arquivo do
repositório.** Todas ficam em variável de ambiente ou em credencial de
serviço.

---

## 1. Vercel, para a Área do Criador abrir (5 min)

Painel da Vercel → seu projeto → **Settings → Environment Variables**.

| Variável | Onde pegar |
| --- | --- |
| `ADMIN_PASSWORD` | Você escolhe. É a senha do `/admin` **e** do `/criador`. |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → Settings → API → chave publishable. |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → **service_role**. Nunca com prefixo `NEXT_PUBLIC_`. |

Depois de salvar, faça um **Redeploy**: a Vercel só lê variável nova em build
novo.

Como saber que funcionou: abra `/criador`. Se aparecer a faixa amarela
avisando que falta a service role, a variável não chegou. Se as abas
carregarem com as ideias de exemplo, está certo.

> A `SUPABASE_SERVICE_ROLE_KEY` ignora todas as regras de segurança do banco.
> Ela só pode existir no servidor. O código foi escrito para isso e o bundle
> do cliente foi conferido: nenhuma chave chega ao navegador.

---

## 2. Supabase, para a arte ser gerada (10 min)

**2.1. Publique a Edge Function.** Precisa da CLI, uma vez só:

```bash
npm install -g supabase
supabase login
supabase link --project-ref wlpvaasjvtqtdtlkoxvy
supabase functions deploy render-card
```

**2.2. Cadastre os segredos** em Supabase → **Edge Functions → Secrets**:

| Segredo | Onde pegar |
| --- | --- |
| `PEXELS_API_KEY` | [pexels.com/api](https://www.pexels.com/api/) — gratuito, sai na hora. |
| `UNSPLASH_ACCESS_KEY` | [unsplash.com/developers](https://unsplash.com/developers) — segunda fonte de foto. |

`SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` o Supabase injeta sozinho na
função. Não cadastre à mão.

Sem pelo menos uma das duas chaves de foto, a função responde erro de
propósito. Ela não tem plano B com imagem gerada.

**Ver a arte antes de tudo isso**, na sua máquina:

```bash
PEXELS_API_KEY=sua-chave npm run arte
```

Gera as pranchas de exemplo em `.arte-exemplo/` com foto real de obra,
imposto e dinheiro. É a forma mais rápida de julgar o visual.

---

## 3. n8n, para rodar sozinho (15 min)

**3.1.** Importe os três arquivos de `n8n/` em Workflows → Import from File.

**3.2.** Crie as credenciais (Credentials → Add credential). Os nomes
precisam ser exatos, porque três são do mesmo tipo:

| Credencial | Tipo | Valor |
| --- | --- | --- |
| Supabase | Supabase API | Host do projeto + service role key |
| Anthropic | Anthropic API | `ANTHROPIC_API_KEY` do console.anthropic.com |
| `Apify Bearer` | Header Auth | `Authorization` = `Bearer SEU_APIFY_TOKEN` |
| `Instagram Bearer` | Header Auth | `Authorization` = `Bearer SEU_IG_ACCESS_TOKEN` |
| `Supabase Service Role Bearer` | Header Auth | `Authorization` = `Bearer SUA_SERVICE_ROLE_KEY` |

**3.3.** Em cada workflow, abra o nó **Config** e troque
`https://SEU-PROJETO.supabase.co` pelo endereço real. Em `coleta`, liste os
perfis concorrentes. Em `publicacao`, preencha o `ig_user_id`.

**3.4.** Rode um por um na mão (**Execute Workflow**), nesta ordem:
`coleta`, depois `pauta`, depois `publicacao`. Só ative o agendamento de cada
um depois que ele passar.

---

## 4. Instagram, por último (20 min)

É o único passo irreversível: um post publicado é público. O roteiro completo,
com verificação de token, criação de uma publicação de teste descartável e a
tabela de erros comuns, está em
[`publicacao-instagram.md`](./publicacao-instagram.md).

Não pule a verificação da URL pública da imagem. É onde essa integração mais
quebra, e o erro que o Instagram devolve não explica nada.

---

## Limpar os dados de exemplo

Deixei algumas linhas marcadas com `[exemplo]` para as abas não nascerem
vazias. Quando não precisar mais, no SQL Editor:

```sql
delete from public.publicacoes where titulo_interno like '[exemplo]%';
delete from public.ideias where titulo like '[exemplo]%';
delete from public.referencias where url like 'https://instagram.com/p/exemplo-%';
```

---

## Pendências que encontrei

**Nenhum lead foi salvo. Nunca.** As duas tabelas de leads do projeto,
`public.leads` e `disparo.leads`, estão com **zero linhas**. Isso não é efeito
da pausa: uma pausa não apaga dados. O mais provável é que as variáveis do
Supabase nunca tenham sido configuradas na Vercel, e o código então caiu no
plano B de `lib/db.ts`, que grava num arquivo local. Na Vercel esse arquivo é
descartado a cada deploy, então todo contato da calculadora foi perdido.

Verifique isso antes de qualquer outra coisa desta lista. É o item mais caro:
enquanto ficar assim, cada visitante que preenche o formulário vira nada. O
passo 1 acima resolve, porque é ele que finalmente liga o site ao banco.

Como conferir depois: preencha o formulário do site você mesmo e veja se ele
aparece em `/admin`.

**O projeto Supabase estava pausado.** Religuei para aplicar as migrations.
Enquanto esteve pausado, o site também não conseguiria salvar nada, nem se as
variáveis estivessem certas.

**Uma função antiga está exposta.** `public.notificar_novo_lead_whatsapp()` é
`SECURITY DEFINER` e pode ser chamada por qualquer visitante via
`/rest/v1/rpc/`. Na prática, um estranho consegue disparar sua notificação de
WhatsApp. É anterior a este trabalho e não foi alterada. Corrigir é rápido:

```sql
revoke execute on function public.notificar_novo_lead_whatsapp() from anon, authenticated;
```

Só rode isso se a função for chamada por trigger (que é o uso normal). Se algo
no site a chamar por RPC, isso quebraria essa chamada.
