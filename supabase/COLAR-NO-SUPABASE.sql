-- ARQUIVO PRONTO PARA COLAR NO SQL EDITOR DO SUPABASE.
-- Equivale a supabase/migrations/0001 + 0002 juntas, sem os comentarios longos.
-- Testado em Postgres: roda do zero e roda de novo sem erro.


-- ========== 1. TABELA DE LEADS DO SITE ==========
create table if not exists public.leads (
  id            bigint generated always as identity primary key,
  criado_em     timestamptz not null default now(),
  nome          text not null,
  whatsapp      text not null,
  email         text,
  situacao_obra text,
  dados_obra    jsonb not null default '{}'::jsonb,
  resultado     jsonb not null default '{}'::jsonb,
  origem        text,
  consentimento boolean not null default false
);
create index if not exists leads_criado_em_idx on public.leads (criado_em desc);
alter table public.leads enable row level security;
drop policy if exists "leads: insert publico" on public.leads;
create policy "leads: insert publico" on public.leads
  for insert to anon, authenticated with check (consentimento = true);
revoke all on public.leads from anon, authenticated;
grant insert on public.leads to anon, authenticated;

-- ========== 2. SCHEMA DA AUTOMACAO ==========
create schema if not exists disparo;

create table if not exists disparo.leads (
  id                  bigint generated always as identity primary key,
  criado_em           timestamptz not null default now(),
  atualizado_em       timestamptz not null default now(),
  ultimo_contato      timestamptz,
  telefone            text not null unique,
  nome                text,
  nome_cliente        text,
  papel               text,
  cidade              text,
  regiao              text,
  obras               jsonb not null default '[]'::jsonb,
  multi_obra          boolean not null default false,
  metragem            text,
  inicio              text,
  termino             text,
  estado              text,
  pf_pj               text,
  piscina             text,
  destinacao          text,
  pre_moldados        text,
  concreto_usinado    text,
  obs                 text,
  origem              text,
  possivel_decadencia boolean not null default false,
  sem_celular         boolean not null default false,
  receptividade       text,
  perfil              text,
  status              text not null default 'novo'
);
create index if not exists disparo_leads_status_idx    on disparo.leads (status);
create index if not exists disparo_leads_criado_em_idx on disparo.leads (criado_em asc);
create index if not exists disparo_leads_regiao_idx    on disparo.leads (regiao);
create index if not exists disparo_leads_fila_idx on disparo.leads (criado_em asc)
  where status = 'novo' and sem_celular = false;

create table if not exists disparo.mensagens (
  id           bigint generated always as identity primary key,
  criado_em    timestamptz not null default now(),
  telefone     text not null,
  direcao      text not null check (direcao in ('in', 'out')),
  conteudo     text,
  template_idx integer,
  status       text
);
create index if not exists disparo_mensagens_telefone_idx on disparo.mensagens (telefone, criado_em desc);
create index if not exists disparo_mensagens_out_idx on disparo.mensagens (criado_em desc) where direcao = 'out';

create table if not exists disparo.config (
  chave         text primary key,
  valor         text not null,
  descricao     text,
  atualizado_em timestamptz not null default now()
);

insert into disparo.config (chave, valor, descricao) values
  ('TEST_MODE',          'true',          'true = nada vai para lead real; tudo vai para NUMERO_TESTE.'),
  ('NUMERO_TESTE',       '5519997108907', 'Destino de todas as mensagens enquanto TEST_MODE=true.'),
  ('JANELA_INICIO',      '9',             'Hora (SP) em que o disparo pode comecar.'),
  ('JANELA_FIM',         '19',            'Hora (SP) em que o disparo para.'),
  ('MAX_HORA',           '15',            'Teto de mensagens por hora.'),
  ('MAX_DIA_INICIAL',    '20',            'Teto diario no primeiro dia (aquecimento do chip).'),
  ('MAX_DIA_INCREMENTO', '15',            'Quanto o teto diario cresce por dia.'),
  ('MAX_DIA_TETO',       '90',            'Teto diario maximo.'),
  ('LOTE_MAX_EXECUCAO',  '8',             'Maximo de mensagens por execucao (a cada 30 min).'),
  ('DELAY_MIN_S',        '30',            'Intervalo minimo entre mensagens, em segundos.'),
  ('DELAY_MAX_S',        '90',            'Intervalo maximo entre mensagens, em segundos.')
on conflict (chave) do nothing;

create table if not exists disparo.log_ingestao (
  id        bigint generated always as identity primary key,
  criado_em timestamptz not null default now(),
  tipo      text not null,
  detalhe   jsonb
);
create index if not exists disparo_log_ingestao_criado_em_idx on disparo.log_ingestao (criado_em desc);

create or replace function disparo.toca_atualizado_em()
returns trigger language plpgsql as $$
begin
  new.atualizado_em := now();
  return new;
end;
$$;
drop trigger if exists leads_atualizado_em on disparo.leads;
create trigger leads_atualizado_em before update on disparo.leads
  for each row execute function disparo.toca_atualizado_em();

alter table disparo.leads        enable row level security;
alter table disparo.mensagens    enable row level security;
alter table disparo.config       enable row level security;
alter table disparo.log_ingestao enable row level security;
revoke all on all tables in schema disparo from anon, authenticated;
revoke all on schema disparo from anon, authenticated;

-- ========== 3. CONFIRMACAO ==========
select table_schema || '.' || table_name as tabela_criada
from information_schema.tables
where table_schema in ('public', 'disparo')
order by 1;
