-- ============================================================
-- ÁREA DO CRIADOR — bucket das pranchas
--
-- O Instagram baixa a imagem por URL: o arquivo precisa estar em HTTPS
-- direto, sem redirecionamento e sem exigir token. Por isso o bucket é
-- público para leitura.
--
-- Escrever nele continua fechado: `anon` e `authenticated` não têm
-- policy nenhuma em storage.objects para este bucket, e quem grava é a
-- Edge Function render-card com service_role, que ignora RLS.
--
-- O limite de 8 MB e o mime type único (image/jpeg) são os do próprio
-- Instagram. O banco recusa qualquer coisa fora disso, então um PNG
-- por engano falha no upload em vez de falhar na publicação.
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('publicacoes', 'publicacoes', true, 8388608, array['image/jpeg'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
