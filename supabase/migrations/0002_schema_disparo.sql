-- ============================================================
-- 0002 — Schema `disparo` (automação de prospecção no WhatsApp)
-- ============================================================
-- Usado pelos workflows do n8n (Fluxo A: ingestão + disparo;
-- Fluxo B: atendimento da Ana). Fica em schema PRÓPRIO para nunca
-- se misturar com `public`, que pertence ao site.
--
-- Nada aqui é exposto via API pública: o RLS fica ligado e sem
-- policies, e o n8n acessa por conexão Postgres direta (service_role /
-- usuário do banco), que ignora RLS.
-- ============================================================

create schema if not exists disparo;

-- ------------------------------------------------------------
-- leads — um registro por TELEFONE (não por obra).
-- Um mesmo contato pode aparecer em várias obras do relatório;
-- nesse caso acumulamos as obras em `obras` e marcamos multi_obra.
-- ------------------------------------------------------------
create table if not exists disparo.leads (
  id                  bigint generated always as identity primary key,
  criado_em           timestamptz not null default now(),
  atualizado_em       timestamptz not null default now(),

  -- Identificação (telefone normalizado E.164 sem "+", ex.: 5519997108907)
  telefone            text not null unique,
  nome                text,
  papel               text,              -- proprietário, responsável técnico, construtora...
  cidade              text,
  regiao              text,

  -- Obras vinculadas a este contato (array de objetos do relatório)
  obras               jsonb not null default '[]'::jsonb,
  multi_obra          boolean not null default false,

  -- Dados coletados pela Ana na conversa
  metragem            numeric,
  inicio              date,
  termino             date,
  piscina             boolean,
  pf_pj               text,              -- 'PF' | 'PJ'
  pre_moldados        boolean,
  concreto_usinado    boolean,
  destinacao          text,              -- residencial, comercial, venda...

  -- Sinal de oportunidade: obra antiga o bastante para decadência
  possivel_decadencia boolean not null default false,

  -- Classificação da conversa
  receptividade       text,              -- quente | morno | frio | hostil
  perfil              text,              -- perfil comercial inferido pela Ana

  -- Máquina de estados do lead
  status              text not null default 'novo'
);

comment on table  disparo.leads is 'Leads de regularização de obras (INSS/SERO) vindos dos relatórios Guia da Construção.';
comment on column disparo.leads.telefone is 'Telefone normalizado E.164 sem "+". Chave natural de deduplicação.';
comment on column disparo.leads.obras is 'Obras do relatório atribuídas a este contato.';
comment on column disparo.leads.possivel_decadencia is 'Obra antiga o suficiente para argumento de decadência do crédito.';

-- Estados possíveis do lead ao longo do funil.
alter table disparo.leads drop constraint if exists leads_status_check;
alter table disparo.leads add constraint leads_status_check
  check (status in (
    'novo',          -- ingerido, ainda não abordado
    'enfileirado',   -- selecionado para o disparo do dia
    'enviado',       -- mensagem entregue à Z-API
    'respondeu',     -- lead respondeu, Ana conduzindo
    'qualificado',   -- dados coletados
    'transferido',   -- handoff para o especialista (Número 2)
    'descartado',
    'optout',        -- pediu para não receber mais
    'erro'
  ));

create index if not exists disparo_leads_status_idx    on disparo.leads (status);
create index if not exists disparo_leads_criado_em_idx on disparo.leads (criado_em desc);
create index if not exists disparo_leads_regiao_idx    on disparo.leads (regiao);

-- ------------------------------------------------------------
-- mensagens — histórico completo das duas direções.
-- ------------------------------------------------------------
create table if not exists disparo.mensagens (
  id         bigint generated always as identity primary key,
  criado_em  timestamptz not null default now(),
  lead_id    bigint references disparo.leads (id) on delete cascade,
  telefone   text not null,
  direcao    text not null check (direcao in ('saida', 'entrada')),
  conteudo   text,
  template   text,               -- qual dos templates rotativos foi usado
  zapi_id    text,               -- message id devolvido pela Z-API
  status     text,               -- enviado | entregue | lido | falha
  erro       text
);

comment on table disparo.mensagens is 'Log de todas as mensagens trocadas, nos dois sentidos.';

create index if not exists disparo_mensagens_lead_idx     on disparo.mensagens (lead_id);
create index if not exists disparo_mensagens_telefone_idx on disparo.mensagens (telefone, criado_em desc);

-- ------------------------------------------------------------
-- config — parâmetros operacionais lidos pelos workflows em tempo de
-- execução, para mudar comportamento sem reeditar o n8n.
-- ------------------------------------------------------------
create table if not exists disparo.config (
  chave         text primary key,
  valor         text not null,
  descricao     text,
  atualizado_em timestamptz not null default now()
);

comment on table disparo.config is 'Parâmetros do disparo, editáveis sem alterar os workflows.';

insert into disparo.config (chave, valor, descricao) values
  ('NUMERO_DISPARO',      '5519997108907', 'Número 1 (chip DDD 19) que faz a abordagem inicial.'),
  ('NUMERO_ESPECIALISTA', '',              'Número 2 — especialista humano que recebe o handoff.'),
  ('CANAL_NOTIFICACAO',   '',              'Telefone/grupo avisado quando um lead é transferido.'),
  ('TEST_MODE',           'true',          'true = não envia de verdade, apenas registra o que seria enviado.'),
  ('MAX_DIA',             '30',            'Teto de mensagens por dia (aquecimento gradual do chip).'),
  ('THROTTLE_MIN_S',      '30',            'Intervalo mínimo entre mensagens, em segundos.'),
  ('THROTTLE_MAX_S',      '90',            'Intervalo máximo entre mensagens, em segundos.')
on conflict (chave) do nothing;

-- ------------------------------------------------------------
-- log_ingestao — um registro por relatório processado (idempotência).
-- ------------------------------------------------------------
create table if not exists disparo.log_ingestao (
  id              bigint generated always as identity primary key,
  criado_em       timestamptz not null default now(),
  gmail_id        text unique,     -- id da mensagem no Gmail: evita reprocessar
  assunto         text,
  arquivo         text,
  regiao          text,
  contatos_lidos  integer not null default 0,
  contatos_novos  integer not null default 0,
  duplicados      integer not null default 0,
  erros           integer not null default 0,
  detalhe         jsonb
);

comment on table  disparo.log_ingestao is 'Auditoria de cada relatório do Guia da Construção processado.';
comment on column disparo.log_ingestao.gmail_id is 'Id da mensagem no Gmail — garante que o mesmo relatório não entre duas vezes.';

-- ------------------------------------------------------------
-- atualizado_em automático em disparo.leads
-- ------------------------------------------------------------
create or replace function disparo.toca_atualizado_em()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em := now();
  return new;
end;
$$;

drop trigger if exists leads_atualizado_em on disparo.leads;
create trigger leads_atualizado_em
  before update on disparo.leads
  for each row execute function disparo.toca_atualizado_em();

-- ------------------------------------------------------------
-- Segurança: RLS ligado e SEM policies — nenhum acesso via anon/
-- authenticated. O n8n entra por conexão direta, que ignora RLS.
-- ------------------------------------------------------------
alter table disparo.leads        enable row level security;
alter table disparo.mensagens    enable row level security;
alter table disparo.config       enable row level security;
alter table disparo.log_ingestao enable row level security;

revoke all on all tables in schema disparo from anon, authenticated;
revoke all on schema disparo from anon, authenticated;
