#!/usr/bin/env bash
# guard.sh: PreToolUse (matcher Bash). exit 0 = passa; exit 2 = bloqueia (stderr volta ao agente)

CMD="$(node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{try{process.stdout.write(JSON.parse(d).tool_input?.command??"")}catch{}})')"

bloquear() { echo "guard.sh: bloqueado: $1" >&2; exit 2; }

# 1) .env como caminho/token (não casa process.env nem .env.example)
RE_ENV='(^|[[:space:]/"'"'"'=<])\.env($|[[:space:]"'"'"';|&)>])'
[[ $CMD =~ $RE_ENV ]] && bloquear "acesso ao .env (segredos)"

# 2) grep recursivo tendo a raiz (. ou ./) como alvo
RE_BUSCA='grep[[:space:]]+(.*[[:space:]])?-[a-zA-Z]*[rR][a-zA-Z]*[[:space:]].*[[:space:]]\.\/?[[:space:]]*($|[;|&])'
[[ $CMD =~ $RE_BUSCA ]] && bloquear "busca recursiva a partir da raiz (pode varrer o .env)"

exit 0