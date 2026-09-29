-- ============================================================
-- 0002 — Schema `disparo` (automação de prospecção no WhatsApp)
-- ============================================================
-- Consumido pelos workflows em n8n/workflows/:
--   fluxo-a-ingestao-disparo.json  — lê e-mail, faz parse do PDF, dispara
--   fluxo-b-ana.json               — atende as respostas com a Ana
--
-- Este arquivo foi derivado do SQL que os próprios workflows executam,
-- não de memória. Cada coluna abaixo é referenciada por um INSERT,
-- UPDATE ou SELECT real. Mudar nome ou tipo de coluna aqui quebra os
-- workflows em silêncio, porque eles montam SQL como string.
--
-- Fica em schema PRÓPRIO para nunca se misturar com `public`, que
-- pertence ao site. O n8n acessa por conexão Postgres direta, que
-- ignora RLS.
-- ============================================================

create schema if not exists disparo;

-- ------------------------------------------------------------
-- leads — um registro por TELEFONE (não por obra).
-- `telefone` é a chave natural: o Fluxo A faz
-- `on conflict (telefone) do update`, então o UNIQUE é obrigatório.
-- ------------------------------------------------------------
create table if not exists disparo.leads (
  id                  bigint generated always as identity primary key,
  criado_em           timestamptz not null default now(),
  atualizado_em       timestamptz not null default now(),
  ultimo_contato      timestamptz,

  -- Identificação (telefone normalizado, só dígitos, ex.: 5519997108907)
  telefone            text not null unique,
  nome                text,          -- contato que será abordado
  nome_cliente        text,          -- nome do cliente como veio no relatório
  papel               text,          -- proprietário, responsável técnico, construtora...
  cidade              text,
  regiao              text,

  -- Obras vinculadas a este contato
  obras               jsonb not null default '[]'::jsonb,
  multi_obra          boolean not null default false,

  -- ATENÇÃO: os campos abaixo são TEXT de propósito.
  -- O Fluxo A grava o que veio do relatório e a Ana grava texto livre
  -- do lead ("aproximadamente 120", "começou em jan/2019", "SIM").
  -- Tipar como numeric/date/boolean faria o UPDATE da Ana estourar em
  -- runtime na primeira resposta fora do formato.
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
  origem              text,          -- 'guia_da_construcao'

  -- Sinais calculados na ingestão
  possivel_decadencia boolean not null default false,
  sem_celular         boolean not null default false,

  -- Classificação da conversa (preenchida pela Ana)
  receptividade       text,
  perfil              text,

  status              text not null default 'novo'
);

comment on table  disparo.leads is 'Leads de regularização de obras (INSS/SERO) vindos dos relatórios Guia da Construção.';
comment on column disparo.leads.telefone is 'Telefone só com dígitos. Chave natural de deduplicação (on conflict).';
comment on column disparo.leads.sem_celular is 'true quando só há fixo: fica com status "erro" e é excluído da fila de disparo.';
comment on column disparo.leads.possivel_decadencia is 'Obra iniciada há mais de 5 anos — argumento de decadência do crédito.';
comment on column disparo.leads.metragem is 'TEXT: recebe texto livre da Ana, não apenas número.';
comment on column disparo.leads.status is
  'novo → enviado → respondeu → coletando → qualificado → transferido. '
  'Também: "erro" (sem celular na ingestão) e "optout" (pediu para sair). '
  'Sem CHECK de propósito: os workflows montam SQL como string, e uma '
  'restrição incompleta derrubaria a automação em vez de apenas avisar.';

create index if not exists disparo_leads_status_idx    on disparo.leads (status);
create index if not exists disparo_leads_criado_em_idx on disparo.leads (criado_em asc);
create index if not exists disparo_leads_regiao_idx    on disparo.leads (regiao);
-- Espelha exatamente o WHERE da fila do Fluxo A.
create index if not exists disparo_leads_fila_idx
  on disparo.leads (criado_em asc) where status = 'novo' and sem_celular = false;

-- ------------------------------------------------------------
-- mensagens — histórico das duas direções.
-- 'out' = enviada por nós | 'in' = recebida do lead.
-- Os contadores de throttle do Fluxo A contam linhas com direcao='out'.
-- ------------------------------------------------------------
create table if not exists disparo.mensagens (
  id           bigint generated always as identity primary key,
  criado_em    timestamptz not null default now(),
  telefone     text not null,
  direcao      text not null check (direcao in ('in', 'out')),
  conteudo     text,
  template_idx integer,          -- qual dos templates rotativos foi usado
  status       text              -- 'enviada' | 'recebida' | falhas
);

comment on table  disparo.mensagens is 'Log de todas as mensagens trocadas, nos dois sentidos.';
comment on column disparo.mensagens.direcao is 'out = enviada por nós; in = recebida do lead. Base dos contadores de throttle.';

-- Sem FK para disparo.leads: as mensagens são gravadas por telefone,
-- dentro de CTEs que rodam junto com o insert do lead. Uma FK criaria
-- ordem de dependência que o SQL gerado não garante.
create index if not exists disparo_mensagens_telefone_idx on disparo.mensagens (telefone, criado_em desc);
-- Sustenta as três contagens de throttle (hora, dia, total).
create index if not exists disparo_mensagens_out_idx
  on disparo.mensagens (criado_em desc) where direcao = 'out';

-- ------------------------------------------------------------
-- config — parâmetros lidos em tempo de execução via
-- `jsonb_object_agg(chave, valor)`. Permite mudar o comportamento do
-- disparo sem reeditar nem reiniciar o n8n.
-- Todos os valores são TEXT; os workflows convertem.
-- ------------------------------------------------------------
create table if not exists disparo.config (
  chave         text primary key,
  valor         text not null,
  descricao     text,
  atualizado_em timestamptz not null default now()
);

comment on table disparo.config is 'Parâmetros do disparo, editáveis sem alterar os workflows.';

-- Os defaults abaixo são os mesmos embutidos no nó "Selecionar Lote e
-- Montar Mensagens". Ficam explícitos aqui para serem ajustáveis.
insert into disparo.config (chave, valor, descricao) values
  ('TEST_MODE',          'true',          'true = nada vai para o lead real; tudo é desviado para NUMERO_TESTE.'),
  ('NUMERO_TESTE',       '5519997108907', 'Destino de TODAS as mensagens enquanto TEST_MODE=true.'),
  ('JANELA_INICIO',      '9',             'Hora (SP) em que o disparo pode começar.'),
  ('JANELA_FIM',         '19',            'Hora (SP) em que o disparo para. Fora da janela, a execução encerra.'),
  ('MAX_HORA',           '15',            'Teto de mensagens por hora.'),
  ('MAX_DIA_INICIAL',    '20',            'Teto diário no primeiro dia (aquecimento do chip).'),
  ('MAX_DIA_INCREMENTO', '15',            'Quanto o teto diário cresce por dia de aquecimento.'),
  ('MAX_DIA_TETO',       '90',            'Teto diário máximo, alcançado o aquecimento.'),
  ('LOTE_MAX_EXECUCAO',  '8',             'Máximo de mensagens por execução do agendamento (30 min).'),
  ('DELAY_MIN_S',        '30',            'Intervalo mínimo entre mensagens, em segundos.'),
  ('DELAY_MAX_S',        '90',            'Intervalo máximo entre mensagens, em segundos.')
on conflict (chave) do nothing;

-- ------------------------------------------------------------
-- log_ingestao — auditoria de cada relatório processado.
-- O Fluxo A grava `(tipo, detalhe)`; o resumo do lote vai inteiro no
-- jsonb, então novas métricas não exigem migration.
-- ------------------------------------------------------------
create table if not exists disparo.log_ingestao (
  id        bigint generated always as identity primary key,
  criado_em timestamptz not null default now(),
  tipo      text not null,     -- 'ingestao_email'
  detalhe   jsonb              -- resumo do lote (lidos, novos, pulados, erros)
);

comment on table  disparo.log_ingestao is 'Auditoria de cada relatório do Guia da Construção processado.';
comment on column disparo.log_ingestao.detalhe is 'Resumo do lote em JSON — novas métricas não exigem migration.';

create index if not exists disparo_log_ingestao_criado_em_idx on disparo.log_ingestao (criado_em desc);

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
-- Segurança: RLS ligado e SEM policies — nenhum acesso por anon ou
-- authenticated. Só a conexão direta do n8n (que ignora RLS) entra.
-- Estes dados são pessoais de terceiros que nunca pediram contato:
-- não podem ficar atrás de uma chave que roda no navegador.
-- ------------------------------------------------------------
alter table disparo.leads        enable row level security;
alter table disparo.mensagens    enable row level security;
alter table disparo.config       enable row level security;
alter table disparo.log_ingestao enable row level security;

revoke all on all tables in schema disparo from anon, authenticated;
revoke all on schema disparo from anon, authenticated;
