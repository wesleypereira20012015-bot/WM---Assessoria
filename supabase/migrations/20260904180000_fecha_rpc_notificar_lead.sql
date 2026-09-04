-- ============================================================
-- Fecha a função de notificação de lead para chamada por RPC.
--
-- `notificar_novo_lead_whatsapp()` é SECURITY DEFINER e estava com EXECUTE
-- liberado para `anon`, `authenticated` e PUBLIC. Isso a expunha em
-- `/rest/v1/rpc/` como se qualquer visitante do site pudesse dispará-la.
--
-- ISSO NÃO AFETA A CAPTURA DE LEADS.
-- O Postgres não checa o privilégio EXECUTE de quem faz o INSERT na hora em
-- que o trigger dispara. Antes de aplicar aqui, isso foi verificado na
-- prática neste projeto, com uma tabela e uma função descartáveis: com o
-- EXECUTE revogado do `anon`, o INSERT feito como `anon` continuou
-- disparando o trigger normalmente. Depois de aplicar, um lead de teste foi
-- inserido como `anon` e entrou sem erro.
--
-- Esta função e o trigger `trg_novo_lead_whatsapp` são anteriores à Área do
-- Criador e não foram criados por estas migrations; esta é a única
-- alteração feita neles.
-- ============================================================

revoke execute on function public.notificar_novo_lead_whatsapp() from public;
revoke execute on function public.notificar_novo_lead_whatsapp() from anon;
revoke execute on function public.notificar_novo_lead_whatsapp() from authenticated;
