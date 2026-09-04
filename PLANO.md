# PLANO — Área do Criador

## O que já existe (diagnóstico)

- **Framework**: Next.js 15 (App Router) + React 19 + TypeScript. Sem Tailwind, sem lib de UI externa.
- **Estilo**: design system próprio em `app/globals.css` — variáveis (`--marinho-900`, `--ouro-500`, `--creme`, `--titulo`, `--card-bg`, `--linha`) e classes (`.container`, `.section`, `.card`, `.btn .btn-ouro/.btn-ghost/.btn-compacto`, `.field`, `.input`, `.display`, `.mono`, `.chip`, `.sec-escuro`). Estilos pontuais vão inline em `style={{}}`.
- **Fontes**: já carregadas em `app/layout.tsx` via `next/font/google` — Cormorant Garamond, Inter, IBM Plex Mono. Mesma tipografia pedida para a arte.
- **Rotas**: `app/page.tsx`, `/blog`, `/blog/[slug]`, `/politica-de-privacidade`, `/admin` (+ `/admin/csv`), `/api/leads`.
- **Autenticação**: não há Supabase Auth. `lib/admin-auth.ts` usa cookie httpOnly com SHA-256 de `ADMIN_PASSWORD`, verificado no servidor (`estaAutenticado()`), login/logout por Server Action.
- **Supabase**: `@supabase/supabase-js` instalado. `lib/supabase.ts` expõe `supabaseAnon()` (publishable, RLS) e `supabaseService()` (service_role, só servidor). Hoje só a tabela `leads`. **Não existe pasta `supabase/` nem migrations versionadas** — o schema foi criado à mão no painel.
- **Fetch**: `fetch` nativo do cliente para `/api/leads` (`lib/lead-client.ts`); leitura do admin é Server Component chamando `lib/db.ts`.
- **Deploy**: Vercel (variáveis em Settings → Environment Variables), sem `vercel.json`.
- **Nomes**: tudo em português, snake_case no banco, camelCase no TS, comentários em pt-BR.
- Observação: `@neondatabase/serverless` está no `package.json` mas não é usado em nenhum arquivo. Não vou mexer nisso agora.

## Como o módulo novo encaixa

- Rotas em `app/criador/` (`/criador`, `/criador/crm`, `/criador/financeiro`), protegidas pelo **mesmo** `estaAutenticado()` já usado no `/admin`. Nada de segunda senha, nada de Supabase Auth novo.
- Migrations passam a existir em `supabase/migrations/` (arquivos `.sql` numerados). A tabela `leads` fica intocada; as novas tabelas entram por migration própria.
- Acesso ao banco pela Área do Criador: **sempre via servidor** (Server Components + Server Actions) usando `supabaseService()`, atrás do cookie de admin. O cliente nunca fala com o Supabase direto, então nenhuma chave sai no bundle.
- Novas funções de dados em `lib/criador.ts`, no mesmo formato de `lib/db.ts` (funções nomeadas, erro lançado com prefixo `Supabase:`).
- UI reusa as classes existentes e os componentes `components/ui/*`. Componentes novos ficam em `components/criador/`. Sem biblioteca nova de UI, sem novo tema.
- Edge Function em `supabase/functions/render-card/`, workflows em `n8n/`. Nada disso entra no build do Next.
- `.env.example` ganha as chaves novas do brief mantendo as que já existem.

## Dúvidas e decisões tomadas

1. **RLS sem Supabase Auth.** O brief pede "só o usuário autenticado dono da conta", mas o site não tem Supabase Auth — a porta é a senha de admin. Caminho mais simples e reversível: RLS ativo em todas as tabelas novas **sem nenhuma policy de leitura/escrita para `anon` e `authenticated`** (nega tudo por padrão); só `service_role`, que ignora RLS, acessa — a partir do servidor Next e do n8n. Se você quiser depois trocar por login real do Supabase, basta adicionar as policies `auth.uid()`, sem mexer no schema.
2. **Duas convenções de env.** O projeto usa `NEXT_PUBLIC_SUPABASE_URL`; o brief pede `SUPABASE_URL`. Vou documentar as duas no `.env.example` e ler `SUPABASE_URL ?? NEXT_PUBLIC_SUPABASE_URL` no servidor, para não quebrar o que está no ar nem obrigar você a recadastrar variável na Vercel.
3. **Sem framework de teste no projeto.** O teste da Etapa 3 será um script rodável com `npx tsx` que salva os `.jpg` de exemplo em pasta local ignorada pelo git, em vez de instalar Jest/Vitest só para isso.
