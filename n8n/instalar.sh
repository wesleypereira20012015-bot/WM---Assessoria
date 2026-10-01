#!/usr/bin/env bash
# ============================================================
# Instalador do n8n self-hospedado — WM Assessoria
# ============================================================
# Faz o que a Parte 2 do PASSO-A-PASSO.md pede, em um comando:
#   instala o Docker, libera o firewall, pergunta o que falta,
#   gera as senhas, escreve o .env e sobe a stack.
#
# Rodar como root no VPS, de dentro do diretório n8n/:
#   bash instalar.sh
#
# Pode rodar de novo sem medo: ele detecta o que já está feito e
# não sobrescreve um .env existente sem perguntar.
# ============================================================

set -euo pipefail

# Cores só quando a saída é um terminal (não poluem log em arquivo).
if [ -t 1 ]; then
	BOLD=$(printf '\033[1m'); VERDE=$(printf '\033[32m')
	AMARELO=$(printf '\033[33m'); VERMELHO=$(printf '\033[31m')
	ZERA=$(printf '\033[0m')
else
	BOLD=""; VERDE=""; AMARELO=""; VERMELHO=""; ZERA=""
fi

passo() { printf '\n%s==> %s%s\n' "$BOLD" "$1" "$ZERA"; }
ok()    { printf '    %s✓%s %s\n' "$VERDE" "$ZERA" "$1"; }
aviso() { printf '    %s!%s %s\n' "$AMARELO" "$ZERA" "$1"; }
erro()  { printf '\n%sERRO:%s %s\n\n' "$VERMELHO" "$ZERA" "$1" >&2; exit 1; }

# ------------------------------------------------------------
# Verificações antes de mexer em qualquer coisa
# ------------------------------------------------------------
[ "$(id -u)" -eq 0 ] || erro "Rode como root:  sudo bash instalar.sh"
[ -f docker-compose.yml ] || erro "Rode de dentro do diretório n8n/ (onde está o docker-compose.yml)."
[ -f .env.example ] || erro "Falta o .env.example — o diretório n8n/ está incompleto."

printf '\n%s┌──────────────────────────────────────────────┐%s\n' "$BOLD" "$ZERA"
printf '%s│  Instalador do n8n — WM Assessoria           │%s\n' "$BOLD" "$ZERA"
printf '%s└──────────────────────────────────────────────┘%s\n' "$BOLD" "$ZERA"

# ------------------------------------------------------------
# 1. Docker
# ------------------------------------------------------------
passo "Docker"
if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
	ok "já instalado ($(docker --version | cut -d, -f1))"
else
	echo "    instalando — leva uns 2 minutos..."
	curl -fsSL https://get.docker.com | sh >/tmp/docker-install.log 2>&1 \
		|| erro "Falha ao instalar o Docker. Veja /tmp/docker-install.log"
	command -v docker >/dev/null 2>&1 || erro "Docker não ficou disponível. Veja /tmp/docker-install.log"
	ok "instalado"
fi

# ------------------------------------------------------------
# 2. Firewall
# ------------------------------------------------------------
passo "Firewall"
if command -v ufw >/dev/null 2>&1; then
	# A 22 PRIMEIRO e sempre: sem ela, ativar o firewall te tranca fora
	# do servidor e só o painel do provedor recupera o acesso.
	ufw allow 22/tcp >/dev/null 2>&1 || true
	ufw allow 80/tcp >/dev/null 2>&1 || true
	ufw allow 443/tcp >/dev/null 2>&1 || true
	ufw --force enable >/dev/null 2>&1 || true
	ok "portas 22 (seu acesso), 80 e 443 liberadas"
else
	aviso "ufw não encontrado — libere as portas 80 e 443 no painel do provedor"
fi

# ------------------------------------------------------------
# 3. Configuração
# ------------------------------------------------------------
passo "Configuração"

if [ -f .env ]; then
	aviso "já existe um .env aqui."
	printf '    Sobrescrever? Os valores atuais serão perdidos. [s/N] '
	read -r resp </dev/tty
	case "$resp" in
		[sS]*)
			cp .env ".env.backup-$(date +%Y%m%d-%H%M%S)"
			ok "backup salvo como .env.backup-*"
			;;
		*)
			ok "mantendo o .env atual"
			PULAR_ENV=1
			;;
	esac
fi

if [ "${PULAR_ENV:-0}" != "1" ]; then
	echo "    Cinco perguntas. Enter aceita o valor entre [colchetes]."
	echo

	pergunta() { # nome_var "texto" "padrao" "obrigatorio"
		# -n faz de "destino" um apelido para a variável nomeada em $1,
		# então atribuir a ele escreve na variável de fora.
		local -n destino="$1"
		local texto="$2" padrao="$3" obrig="${4:-nao}" valor=""
		while :; do
			if [ -n "$padrao" ]; then
				printf '    %s\n      [%s] ' "$texto" "$padrao"
			else
				printf '    %s\n      ' "$texto"
			fi
			read -r valor </dev/tty
			valor="${valor:-$padrao}"
			if [ -z "$valor" ] && [ "$obrig" = "sim" ]; then
				printf '      %s^ esse é obrigatório.%s\n\n' "$AMARELO" "$ZERA"
				continue
			fi
			break
		done
		destino="$valor"
		echo
	}

	pergunta DOMINIO "1/5 — Subdomínio do n8n (o DNS já tem de apontar para este servidor):" "" sim
	pergunta EMAIL   "2/5 — E-mail para avisos do certificado:" "wesleypereira20012015@gmail.com" sim
	pergunta ZAPI_I  "3/5 — ID da instância na Z-API (app.z-api.io):" "" sim
	pergunta ZAPI_T  "4/5 — Token da instância na Z-API (NÃO o Client-Token):" "" sim
	pergunta CANAL   "5/5 — WhatsApp que recebe os leads qualificados:" "5519997108907" sim

	# Senhas geradas aqui: ninguém precisa inventá-las nem digitá-las.
	CHAVE=$(openssl rand -hex 32)
	SENHA_PG=$(openssl rand -base64 24)

	umask 077   # o .env guarda segredos: só o root lê
	cat > .env <<EOF
# Gerado por instalar.sh em $(date '+%d/%m/%Y %H:%M')
N8N_HOST=${DOMINIO}
ACME_EMAIL=${EMAIL}
POSTGRES_PASSWORD=${SENHA_PG}
N8N_ENCRYPTION_KEY=${CHAVE}
ZAPI_INSTANCE=${ZAPI_I}
ZAPI_TOKEN=${ZAPI_T}
CANAL_NOTIFICACAO=${CANAL}
NUMERO_2=${CANAL}
EOF
	umask 022
	ok ".env criado (somente root consegue ler)"

	# ------------------------------------------------------------
	# A chave de criptografia é o item mais importante do sistema.
	# Mostrar na tela AGORA é a única chance de o dono copiá-la.
	# ------------------------------------------------------------
	cat <<EOF

    ${BOLD}┌──────────────────────────────────────────────────────────────┐
    │  COPIE ESTA CHAVE PARA UM LUGAR SEGURO, FORA DO SERVIDOR     │
    └──────────────────────────────────────────────────────────────┘${ZERA}

      ${CHAVE}

    Ela descriptografa todas as credenciais salvas no n8n (Gmail,
    Z-API, Supabase, Anthropic). Sem ela, um backup deste servidor
    não serve para nada: é recadastrar tudo na mão.

    Guarde no gerenciador de senhas, ou mande para você mesmo.

EOF
	printf '    Já copiou? [Enter para continuar] '
	read -r _ </dev/tty
fi

# ------------------------------------------------------------
# 4. Conferir o DNS antes de subir
# ------------------------------------------------------------
passo "DNS"
DOM=$(grep '^N8N_HOST=' .env | cut -d= -f2-)
IP_LOCAL=$(curl -fsS --max-time 10 https://api.ipify.org 2>/dev/null || echo "")
IP_DOM=$(getent hosts "$DOM" 2>/dev/null | awk '{print $1}' | head -1 || echo "")

if [ -z "$IP_DOM" ]; then
	aviso "$DOM ainda não resolve."
	echo "       O certificado vai falhar. Confira em https://dnschecker.org"
	printf '    Subir mesmo assim? [s/N] '
	read -r r </dev/tty
	case "$r" in [sS]*) ;; *) erro "Parado. Aponte o DNS e rode este script de novo." ;; esac
elif [ -n "$IP_LOCAL" ] && [ "$IP_DOM" != "$IP_LOCAL" ]; then
	aviso "$DOM aponta para $IP_DOM, mas este servidor é $IP_LOCAL."
	echo "       Se o DNS mudou há pouco, pode ser só propagação."
	printf '    Subir mesmo assim? [s/N] '
	read -r r </dev/tty
	case "$r" in [sS]*) ;; *) erro "Parado. Corrija o registro A e rode de novo." ;; esac
else
	ok "$DOM aponta para este servidor ($IP_DOM)"
fi

# ------------------------------------------------------------
# 5. Subir
# ------------------------------------------------------------
passo "Subindo a stack"
echo "    A primeira vez baixa uns 2 GB. Leve uns 5 minutos."
echo
docker compose up -d || erro "Falha ao subir. Veja:  docker compose logs"

passo "Esperando o n8n responder"
PRONTO=0
for i in $(seq 1 60); do
	if docker compose exec -T n8n wget -qO- http://127.0.0.1:5678/healthz 2>/dev/null | grep -q '"ok"'; then
		PRONTO=1; ok "n8n no ar"; break
	fi
	sleep 5
	# Escrito como if, e não com &&: sob "set -e", um && cujo lado
	# esquerdo é falso derruba o script inteiro.
	if [ $((i % 6)) -eq 0 ]; then
		echo "    ...ainda subindo ($((i * 5))s)"
	fi
done

if [ "$PRONTO" != "1" ]; then
	aviso "o n8n não respondeu em 5 minutos."
	echo "       Veja o que aconteceu:  docker compose logs n8n"
fi

passo "Certificado HTTPS"
echo "    O Caddy emite o certificado na primeira visita. Acompanhe com:"
echo "      docker compose logs -f caddy"
echo "    Pronto quando aparecer 'certificate obtained successfully'."

# ------------------------------------------------------------
# Fim
# ------------------------------------------------------------
cat <<EOF

${BOLD}──────────────────────────────────────────────────────────────${ZERA}
${VERDE}Servidor pronto.${ZERA}

  Abra:  ${BOLD}https://${DOM}${ZERA}

  Crie a conta de administrador na primeira tela — use uma senha
  forte, esse endereço fica aberto na internet.

  Depois siga a ${BOLD}Parte 3${ZERA} do PASSO-A-PASSO.md: as 4 credenciais
  (Supabase, Z-API, Anthropic, Gmail) e a importação dos fluxos.

  Comandos úteis, deste diretório:
    docker compose ps            o que está rodando
    docker compose logs -f n8n   o que o n8n está fazendo
    docker compose up -d         aplicar mudanças do .env
${BOLD}──────────────────────────────────────────────────────────────${ZERA}

EOF
