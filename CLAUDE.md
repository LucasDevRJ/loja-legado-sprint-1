@AGENTS.md

- Hooks rodam `npm test` depois de cada edição em `src/` ou `test/`, e o turno só encerra com `npm test` verde. Não rode os testes manualmente a cada mudança.
- Para revisar uma implementação, use o subagente `revisor-codigo`. Passe o caminho do `SPEC.md` e a lista de arquivos alterados (ou o `git diff`), porque ele só lê e não roda comandos.