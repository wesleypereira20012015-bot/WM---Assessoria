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
