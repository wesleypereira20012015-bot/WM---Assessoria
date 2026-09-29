-- ============================================================
-- 0001 — Tabela de leads do SITE (formulário da calculadora e faixa CTA)
-- ============================================================
-- Consumida por lib/db.ts (salvarLead / listarLeads) e pelo painel /admin.
-- Colunas espelham exatamente a interface `Lead` de lib/db.ts.
--
-- Segurança: o site insere com a chave PUBLISHABLE (anon), então o RLS
-- precisa liberar INSERT para anon — e SÓ isso. A leitura fica restrita à
-- service_role (que ignora RLS) usada apenas no servidor pelo /admin.
-- ============================================================

create table if not exists public.leads (
  id            bigint generated always as identity primary key,
  criado_em     timestamptz  not null default now(),
  nome          text         not null,
  whatsapp      text         not null,
  email         text,
  situacao_obra text,
  dados_obra    jsonb        not null default '{}'::jsonb,
  resultado     jsonb        not null default '{}'::jsonb,
  origem        text,
  consentimento boolean      not null default false
);

comment on table  public.leads is 'Leads capturados pelo site (calculadora SERO e faixa CTA).';
comment on column public.leads.dados_obra is 'Entradas do formulário da calculadora (JSON livre).';
comment on column public.leads.resultado  is 'Resultado calculado apresentado ao lead (JSON livre).';
comment on column public.leads.origem     is 'De onde veio o lead (ex.: "calculadora", "cta-rodape").';

-- Consulta do /admin é sempre ordenada por data decrescente.
create index if not exists leads_criado_em_idx on public.leads (criado_em desc);

-- ---------- Row Level Security ----------
alter table public.leads enable row level security;

-- O formulário público pode CRIAR um lead...
drop policy if exists "leads: insert publico" on public.leads;
create policy "leads: insert publico"
  on public.leads
  for insert
  to anon, authenticated
  with check (consentimento = true);

-- ...e nada mais. Sem policy de SELECT/UPDATE/DELETE, o RLS nega essas
-- operações para anon/authenticated. O /admin lê via service_role, que
-- ignora o RLS por definição.

-- ---------- Privilégios explícitos (defesa em profundidade) ----------
-- O Supabase concede privilégios a anon/authenticated por default
-- privileges nas tabelas novas de `public`. Sem as linhas abaixo, a
-- proteção da leitura ficaria dependendo SÓ do RLS: bastaria alguém
-- adicionar uma policy de SELECT por engano para os dados dos leads
-- (nome, WhatsApp, e-mail) vazarem pela chave publishable, que roda no
-- navegador. Explicitar o grant mínimo torna isso independente do
-- comportamento padrão do Supabase.
revoke all on public.leads from anon, authenticated;
grant insert on public.leads to anon, authenticated;

-- CUIDADO ao mexer em lib/db.ts: como anon tem INSERT mas não SELECT, um
-- insert com RETURNING é recusado ("permission denied for table leads").
-- Hoje `salvarLead` faz `.insert({...})` sem `.select()`, que não gera
-- RETURNING — por isso funciona. Se algum dia for preciso ler de volta o
-- registro criado (para pegar o id, por exemplo), faça isso no servidor
-- com a service_role, não com a chave publishable.
