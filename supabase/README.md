# Supabase — Área do Criador

Aqui ficam as migrations do banco. O site já estava no ar antes desta pasta
existir, então a tabela `leads` **não** tem migration: ela foi criada à mão no
painel e continua exatamente como está. As migrations abaixo só acrescentam
coisa nova.

## Como aplicar

Pelo painel, que é o caminho mais curto e não exige instalar nada:

1. Supabase → **SQL Editor** → New query.
2. Cole o conteúdo de `migrations/20260904120000_criador_schema.sql` e rode.
3. Repita com `migrations/20260904120100_criador_storage.sql`.
4. Confira em **Table Editor** que apareceram `ideias`, `referencias`,
   `publicacoes` e `assets`, e em **Storage** que existe o bucket
   `publicacoes` marcado como público.

Rodar duas vezes não quebra nada: os arquivos usam `if not exists` e
`on conflict`, e foram testados nesse cenário.

Se um dia você instalar a CLI do Supabase, os mesmos arquivos funcionam com
`supabase db push` sem alteração.

## O que cada migration faz

| Arquivo | Conteúdo |
| --- | --- |
| `20260904120000_criador_schema.sql` | Tabelas `ideias`, `referencias`, `publicacoes` e `assets`, com índices, travas de integridade e RLS. |
| `20260904120100_criador_storage.sql` | Bucket público `publicacoes`, limitado a 8 MB e a arquivos `image/jpeg`. |

## Como a segurança funciona

Não existe login do Supabase neste projeto — a porta da Área do Criador é o
mesmo cookie de administrador que já protege o `/admin`. Então:

- As quatro tabelas têm **RLS ligado e nenhuma policy**. Sem policy, ninguém
  passa.
- Além disso, os papéis `anon` e `authenticated` (os únicos que um navegador
  consegue usar) tiveram **todos os privilégios revogados** nessas tabelas.
- Quem lê e escreve é a `service_role`, que ignora o RLS, sempre a partir do
  servidor: Server Components e Server Actions do Next.js, a Edge Function
  `render-card` e o n8n. Nenhuma chave chega ao navegador.
- O bucket `publicacoes` é público **só para leitura**, porque o Instagram
  baixa a imagem por URL e precisa de HTTPS direto, sem token. Gravar nele
  continua exigindo `service_role`.

Se um dia entrar login de verdade no Supabase, basta acrescentar policies com
`auth.uid()`. O schema não muda.

## Travas que o banco cobra sozinho

Não dependem de a interface ou o n8n se comportarem:

- `publicacoes` só aceita status `agendada` ou `publicada` se `aprovada_em`
  estiver preenchido. **Nada vai ao ar sem aprovação registrada.**
- `agendada` exige `agendada_para`; `reprovada` exige `motivo_reprovacao`.
- Carrossel que saiu do rascunho precisa ter de 2 a 10 pranchas, que é o
  limite do próprio Instagram.
- `assets` exige crédito do fotógrafo preenchido, URL em `https://` e fonte
  `pexels` ou `unsplash` — foto sempre real, nunca gerada.
- `referencias.url` é único, então a recoleta diária pode inserir com
  `on conflict (url) do nothing` sem duplicar nada.
