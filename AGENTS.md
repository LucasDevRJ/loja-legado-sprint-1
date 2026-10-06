# loja-legado
- Loja em Vendure 3.7 (TypeScript, NestJS, GraphQL), SQLite em dev

## Comandos
- `npm test` roda os testes com Vitest.
- `npm run dev` sobe server, worker e dashboard em http://localhost:3000/dashboard.
- `npm run setup` cria o .env e o vendure.sqlite a partir do seed.

## Onde as coisas ficam
- Código novo fica em `src/plugins/<dominio>/`, um plugin por domínio, registrado no array plugins de `src/vendure-config.ts`.
- Exemplos oficiais de action e condition ficam em `node_modules/@vendure/core/dist/config/promotion/actions/` e `.../conditions/`.
- Testes ficam em `test/`, um arquivo por feature.

## Regras do projeto
- Dinheiro é sempre inteiro em centavos. Arredondar uma única vez, com Math.round, no fim da conta.
- PromotionAction de pedido devolve o desconto como número negativo em centavos (ex.: -1500).
- Regra de promoção nova é uma PromotionCondition ou PromotionAction registrada pelo plugin em config.promotionOptions. Sem entidade, resolver ou endpoint novo: cupom, validade e limite de uso a Promotion nativa já faz.
- A base do desconto é order.subTotalWithTax se ctx.channel.pricesIncludeTax for true, e order.subTotal se for false.
- A description de action ou condition nova deve ter pt_BR e en.
- Nos testes de promoção não se sobe banco: ctx e order são objetos falsos só com os campos que a regra lê.

## Nunca
- O `.env` tem segredos, como a PAGAMENTO_API_KEY. Não ler nem mostrar o conteúdo dele.
- Os helpers de `src/misc/preco.ts` (calcSubtotal, aplicarDesconto, frete) alimentam o relatório do financeiro e não podem mudar.
- Não instalar nem atualizar dependências (o lockfile já quebrou o deploy).
- `src/stuff/` e `src/utils/` são legado. Não criar nada lá.
- Não ligar dbConnectionOptions.synchronize, não rodar migration e não apagar nem recriar o vendure.sqlite
