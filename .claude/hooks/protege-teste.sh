#!/usr/bin/env bash
# protege-teste.sh: PreToolUse (matcher Edit|Write). Impede alterar o teste de aceite.
# exit 0 = passa; exit 2 = bloqueia (stderr volta ao agente)

FILE="$(node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{try{process.stdout.write(JSON.parse(d).tool_input?.file_path??"")}catch{}})')"

bloquear() { echo "protege-teste.sh: bloqueado: $1" >&2; exit 2; }

case "$FILE" in
    # TODO: um padrão que case com o caminho do teste de aceite.
    #       Lembre: o file_path chega ABSOLUTO (/home/lucas/loja-legado-sprint1/test/...).
    #       Dica: no case do bash, * casa qualquer coisa.
    
    */test/cupom.test.ts) bloquear "test/cupom.test.ts é o critério de aceite da PO e não pode ser alterado. Corrija o código, não o teste." ;;
esac

exit 0