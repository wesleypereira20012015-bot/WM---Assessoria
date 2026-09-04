-- ============================================================
-- ÁREA DO CRIADOR — schema base
--
-- Tabelas da produção de conteúdo do Instagram da WM Assessoria.
-- Esta migration é aditiva: NÃO toca na tabela `leads`, que continua
-- exatamente como está hoje.
--
-- SEGURANÇA
-- RLS ligado nas quatro tabelas e nenhuma policy criada. Sem policy,
-- `anon` e `authenticated` não leem nem escrevem nada. O acesso é só
-- por `service_role` (que ignora RLS), a partir do servidor Next.js
-- (atrás do cookie de admin) e do n8n. Se um dia entrar login de
-- verdade no Supabase, basta adicionar policies com auth.uid() — o
-- schema não muda.
--
-- Chaves em uuid, e não em serial, porque o id da publicação vira
-- caminho de arquivo em bucket público (`{publicacao_id}/{ordem}.jpg`).
-- ============================================================

-- ------------------------------------------------------------
-- ideias — a fila de entrada. É aqui que o dono do site escreve.
-- ------------------------------------------------------------
create table if not exists public.ideias (
  id uuid primary key default gen_random_uuid(),
  titulo text not null check (length(btrim(titulo)) > 0),
  descricao text,
  origem text not null default 'manual'
    check (origem in ('manual', 'instagram', 'noticia')),
  status text not null default 'nova'
    check (status in ('nova', 'em_producao', 'descartada')),
  prioridade integer not null default 0,
  criado_em timestamptz not null default now()
);

comment on table public.ideias is
  'Fila de ideias de conteúdo. Origem manual (digitada na Área do Criador), instagram (tirada de uma referência) ou noticia.';

-- A aba Ideias lista por prioridade e a pauta semanal só olha as novas.
create index if not exists ideias_status_prioridade_idx
  on public.ideias (status, prioridade desc, criado_em desc);

-- ------------------------------------------------------------
-- referencias — posts de concorrentes coletados pela Apify.
-- ------------------------------------------------------------
create table if not exists public.referencias (
  id uuid primary key default gen_random_uuid(),
  perfil text not null,
  url text not null,
  legenda text,
  curtidas integer not null default 0 check (curtidas >= 0),
  comentarios integer not null default 0 check (comentarios >= 0),
  score_engajamento numeric(12, 4) not null default 0,
  publicado_em timestamptz,
  coletado_em timestamptz not null default now(),
  tipo text check (tipo in ('reel', 'carrossel', 'imagem'))
);

comment on table public.referencias is
  'Posts de perfis concorrentes coletados diariamente. score_engajamento = (curtidas + comentarios * 3) normalizado pela mediana do próprio perfil.';

-- Índice único pedido no brief: a recoleta diária reencontra os mesmos
-- posts, e o insert precisa poder ignorar o que já existe.
create unique index if not exists referencias_url_key
  on public.referencias (url);

-- A aba Referências ordena por score; a pauta filtra os últimos 30 dias.
create index if not exists referencias_score_idx
  on public.referencias (score_engajamento desc);
create index if not exists referencias_perfil_publicado_idx
  on public.referencias (perfil, publicado_em desc);

-- ------------------------------------------------------------
-- publicacoes — o post em si, do rascunho até o ar.
-- ------------------------------------------------------------
create table if not exists public.publicacoes (
  id uuid primary key default gen_random_uuid(),
  ideia_id uuid references public.ideias (id) on delete set null,
  formato text not null check (formato in ('carrossel', 'reel')),
  titulo_interno text not null check (length(btrim(titulo_interno)) > 0),
  legenda text,
  hashtags text[] not null default '{}',
  roteiro jsonb,
  cards jsonb,
  status text not null default 'rascunho'
    check (status in (
      'rascunho',
      'aguardando_aprovacao',
      'aprovada',
      'reprovada',
      'agendada',
      'publicada',
      'erro'
    )),
  motivo_reprovacao text,
  aprovada_em timestamptz,
  agendada_para timestamptz,
  publicada_em timestamptz,
  ig_media_id text,
  erro_detalhe text,
  criado_em timestamptz not null default now(),

  -- Nada vai para o ar sem aprovação registrada. O banco recusa, não
  -- depende de a interface ou o n8n se comportarem.
  constraint publicacoes_exige_aprovacao check (
    status not in ('agendada', 'publicada') or aprovada_em is not null
  ),

  -- Reprovar sem dizer o motivo não ajuda ninguém na próxima rodada.
  constraint publicacoes_reprovacao_com_motivo check (
    status <> 'reprovada'
    or (motivo_reprovacao is not null and length(btrim(motivo_reprovacao)) > 0)
  ),

  -- Agendar exige data.
  constraint publicacoes_agendada_com_data check (
    status <> 'agendada' or agendada_para is not null
  ),

  constraint publicacoes_cards_lista check (
    cards is null or jsonb_typeof(cards) = 'array'
  ),

  -- Limite do próprio Instagram: carrossel aceita de 2 a 10 imagens.
  -- Cobrado a partir do momento em que a publicação sai do rascunho.
  constraint publicacoes_carrossel_2_a_10 check (
    formato <> 'carrossel'
    or status not in ('aguardando_aprovacao', 'aprovada', 'agendada', 'publicada')
    or (cards is not null and jsonb_array_length(cards) between 2 and 10)
  )
);

comment on table public.publicacoes is
  'Publicações do Instagram, do rascunho até o ar. Só sai do lugar com aprovação humana registrada em aprovada_em.';
comment on column public.publicacoes.cards is
  'Só para carrossel. Lista de pranchas: [{ordem, tipo, titulo, corpo, busca_foto}].';
comment on column public.publicacoes.roteiro is
  'Só para reel. Roteiro do vídeo em JSON.';
comment on column public.publicacoes.aprovada_em is
  'Carimbo da aprovação humana. Sem ele o banco recusa status agendada ou publicada.';

-- A aba Aprovação filtra por status; o calendário ordena por data.
create index if not exists publicacoes_status_idx
  on public.publicacoes (status, criado_em desc);
create index if not exists publicacoes_ideia_id_idx
  on public.publicacoes (ideia_id);
-- O workflow de publicação roda de hora em hora e só olha as agendadas.
create index if not exists publicacoes_agendadas_idx
  on public.publicacoes (agendada_para)
  where status = 'agendada';
create index if not exists publicacoes_calendario_idx
  on public.publicacoes ((coalesce(publicada_em, agendada_para)) desc);

-- ------------------------------------------------------------
-- assets — as pranchas renderizadas, já no Storage público.
-- ------------------------------------------------------------
create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  publicacao_id uuid not null
    references public.publicacoes (id) on delete cascade,
  ordem integer not null check (ordem >= 1),
  url_publica text not null check (url_publica like 'https://%'),
  fonte_foto text not null check (fonte_foto in ('pexels', 'unsplash')),
  credito_fotografo text not null check (length(btrim(credito_fotografo)) > 0),
  url_original_foto text,
  criado_em timestamptz not null default now()
);

comment on table public.assets is
  'Pranchas renderizadas (JPEG 1080x1350) no bucket público publicacoes. Toda linha carrega o crédito do fotógrafo — foto sempre real, de Pexels ou Unsplash, nunca gerada.';

-- Uma prancha por posição. Rerrenderizar sobrescreve, não duplica.
create unique index if not exists assets_publicacao_ordem_key
  on public.assets (publicacao_id, ordem);

-- ------------------------------------------------------------
-- RLS — fechado por padrão nas quatro tabelas.
-- ------------------------------------------------------------
alter table public.ideias enable row level security;
alter table public.referencias enable row level security;
alter table public.publicacoes enable row level security;
alter table public.assets enable row level security;

-- Cinto e suspensório: além do RLS sem policy, tira o privilégio de
-- tabela dos papéis que o navegador consegue usar.
revoke all on table public.ideias from anon, authenticated;
revoke all on table public.referencias from anon, authenticated;
revoke all on table public.publicacoes from anon, authenticated;
revoke all on table public.assets from anon, authenticated;
