# Plano: cupom com teto de 30%

Fonte: `SPEC.md` (regras R1–R7) e o teste de aceite `gabarito:test/cupom.test.ts` (10 testes), lido com `git show` durante o planejamento. Na implementação ele é trazido para `test/cupom.test.ts` sem alteração (passo 0).

## O que o teste exige (resumo)

| Teste | Regra | Entrada | Esperado |
|---|---|---|---|
| percentual simples | R1 | pct 10, subTotal 10000 | `-1000` |
| teto de 30% | R1 | pct 50, subTotal 10000 | `-3000` |
| Math.round | R2 | pct 10, subTotal 3333 | `-333` |
| nunca positivo | R3 | pct 0, 5, 30, 99 | `<= 0` |
| com imposto | R4 | pct 10, `pricesIncludeTax: true`, subTotalWithTax 12000 | `-1200` |
| sem imposto | R4 | pct 10, `pricesIncludeTax: false` | `-1000` |
| 1 cupom / 2 cupons | R5 (aceita até 1 cupom, recusa 2 ou mais) | `couponCodes` com 1 e 2 itens | `true` / `false` |
| pedido sem linhas | R6 | `lines: []` | `false` |
| registro no config | R7 | config com `orderPercentageDiscount` e `minimumOrderAmount` | codes `[nativa, nova]` nas duas listas, na ordem |
| code/description | R7 | as duas defs | code `/^[a-z_]+$/`, description com `pt_BR` e `en` |

Detalhes que o teste fixa:
- Import: `../src/plugins/cupons` → exports `descontoPercentualComTeto`, `cupomUnico`, `configurarCupons` em `src/plugins/cupons/index.ts`.
- O argumento chega como `[{ name: 'pct', value: '50' }]` (string). `PromotionOrderAction.execute` passa por `argsArrayToHash`, que converte conforme o `type` declarado, então o arg **tem que se chamar `pct`** e ser `int`.
- `cupomUnico.check(ctx, order, [], promo)`: a condition não declara args.
- `configurarCupons(config)` recebe um `RuntimeVendureConfig` e devolve um objeto com `promotionOptions.promotionActions/promotionConditions`. Mesma assinatura do `configuration` de um `VendurePlugin` (`PluginConfigurationFn`).

## Arquivos

| Arquivo | Ação |
|---|---|
| `test/cupom.test.ts` | trazer da `gabarito` sem alteração (passo 0) |
| `src/plugins/cupons/desconto-percentual-com-teto.ts` | criar: a `PromotionOrderAction` |
| `src/plugins/cupons/cupom-unico.ts` | criar: a `PromotionCondition` |
| `src/plugins/cupons/index.ts` | criar: `configurarCupons`, `CuponsPlugin` e re-exports |
| `src/vendure-config.ts` | alterar: acrescentar `CuponsPlugin` no array `plugins` (e o import) e remover o TODO de cupons (linha 67) |

Fora do escopo e intocados: os testes que já existem em `test/`, `src/misc/preco.ts`, `src/stuff/`, `src/utils/`, `package.json`, `package-lock.json`, `.env`, `vendure.sqlite`, migrations, o objeto `customFields` (só o comentário TODO acima dele sai).

Opcional, se ficar mais simples: deixar tudo em `index.ts` só. A divisão em três arquivos é só para facilitar a leitura.

## Passos (em ordem)

### 0. Trazer o teste de aceite (todas as regras)
- `git show gabarito:test/cupom.test.ts > test/cupom.test.ts`, antes de qualquer código. O arquivo não é editado depois disso.
- Até o passo 3 terminar, a suíte fica vermelha (o import `../src/plugins/cupons` ainda não existe). É esperado: os hooks rodam `npm test` a cada edição, e o turno de implementação só fecha com tudo verde.

### 1. Action `desconto_percentual_com_teto` (R1, R2, R3, R4, parte de R7)
`src/plugins/cupons/desconto-percentual-com-teto.ts`, seguindo o modelo de `node_modules/@vendure/core/dist/config/promotion/actions/order-percentage-discount-action.js`:
- `pct` é inteiro (tipo `int`): é mais simples, e o teste só usa inteiros.
- `new PromotionOrderAction({ code: 'desconto_percentual_com_teto', args: { pct: { type: 'int', ui: { component: 'number-form-input', suffix: '%', min: 0, max: 30 } } }, description: [pt_BR, en], execute })`. O `max: 30` na UI impede o admin de cadastrar mais de 30% achando que vale; o `execute` continua saturando no teto (50 → 30%), porque o teste exige isso. O `max: 30` é decisão da revisão do plano e não está escrito no `SPEC.md`; não muda nenhum teste.
- Constante `TETO_PCT = 30`.
- `execute(ctx, order, args)`:
  1. `base = ctx.channel.pricesIncludeTax ? order.subTotalWithTax : order.subTotal` (R4).
  2. `pct = Math.min(Math.max(args.pct, 0), TETO_PCT)`: teto de 30 (R1) e piso de 0 para que pct negativo não vire acréscimo (R3). Se `args.pct` vier `NaN` (arg vazio: `parseInt('')`), tratar como 0, porque `Math.max(NaN, 0)` é `NaN` e o retorno seria `NaN`, que não é `<= 0` (R3).
  3. `desconto = Math.round(base * pct / 100)`: um único arredondamento, no fim, sobre o valor positivo (R2). Arredondar o positivo e só depois negar evita o `Math.round(-x.5)`, que arredonda para cima (para zero).
  4. `return desconto === 0 ? 0 : -desconto`: devolve negativo (R3) e não devolve `-0`.
- Description, por exemplo: pt_BR `Desconto de { pct }% no pedido (máximo 30%)` e en `Discount order by { pct }% (capped at 30%)`.
- Não usa os helpers de `src/misc/preco.ts`.

### 2. Condition `cupom_unico` (R5, R6, parte de R7)
`src/plugins/cupons/cupom-unico.ts`, seguindo `.../conditions/min-order-amount-condition.js`:
- `new PromotionCondition({ code: 'cupom_unico', args: {}, description: [pt_BR, en], check })`.
- `check(ctx, order)`: `return order.lines.length > 0 && order.couponCodes.length <= 1`.
  - `lines.length > 0`: R6.
  - `couponCodes.length <= 1`: R5, aceita até 1 cupom e recusa 2 ou mais. Com 0 cupons, uma promoção com `couponCode` nem é aplicada pelo Vendure, então não precisa recusar aqui.
- Description, por exemplo: pt_BR `Pedido com itens e no máximo um cupom` e en `Order has items and at most one coupon`.

### 3. `configurarCupons` + plugin (R7)
`src/plugins/cupons/index.ts`:
- `export function configurarCupons(config: RuntimeVendureConfig): RuntimeVendureConfig`, que devolve
  `{ ...config, promotionOptions: { ...config.promotionOptions, promotionActions: [...(config.promotionOptions.promotionActions ?? []), descontoPercentualComTeto], promotionConditions: [...(… ?? []), cupomUnico] } }`.
  - Acrescenta no fim e preserva a ordem das nativas: é o que o `toEqual([nativa, nova])` do teste exige.
  - Não remove nem altera nada.
- `@VendurePlugin({ imports: [PluginCommonModule], configuration: configurarCupons }) export class CuponsPlugin {}`. Sem entidade, resolver, endpoint nem `compatibility` extra.
- Re-export de `descontoPercentualComTeto` e `cupomUnico`.

### 4. Registrar no `src/vendure-config.ts` (R7 em runtime)
- `import { CuponsPlugin } from './plugins/cupons';` e `CuponsPlugin` no array `plugins`.
- Remover o TODO de cupons ao registrar o plugin: a linha 67, `// TODO(Fulano, 2025): cupons. Tentamos em src/stuff/carrinho-antigo.ts, nao deu certo. Ver com o Fulano.`. Ele fala justamente deste módulo. O `customFields: {}` fica como está.
- Nada mais muda: `synchronize` continua `false`, sem migration.

### 5. Verificação
O `SPEC.md` pede `npm test && npx tsc --noEmit`; os itens 1 e 2 são esses dois comandos.

1. `npm test`: o teste de aceite fica em `test/cupom.test.ts` (trazido do gabarito antes da implementação) e passa 10/10, sem alteração. O resto da suíte (`test/preco.test.ts`, `test/utils.test.ts`) continua verde. Os hooks já rodam isso depois de cada edição.
2. `npx tsc --noEmit`: tipagem do plugin e do `vendure-config.ts`.
3. Conferir o escopo com `git status`/`git diff --stat` e `git diff gabarito -- test/cupom.test.ts` (tem que sair vazio): só `src/plugins/cupons/*`, `src/vendure-config.ts` e `test/cupom.test.ts` (mais `docs/plano.md` e o `SPEC.md` já não rastreado).
4. Revisão com o subagente `revisor-codigo`, passando `SPEC.md` e a lista de arquivos alterados.
5. (Opcional, manual) `npm run dev` e conferir no dashboard que a action e a condition aparecem com as descriptions em pt_BR, ao lado das nativas.

## Cobertura das regras

| Regra | Passo(s) | Como é verificada |
|---|---|---|
| R1 action com `pct` (int) e teto 30% | 0, 1 | testes "percentual simples" e "teto de 30%" |
| R2 centavos com `Math.round` | 0, 1 | teste "Math.round" (3333 → -333) |
| R3 nunca positivo | 0, 1 (piso 0, retorno negado) | teste "nunca positivo" |
| R4 base com/sem imposto | 0, 1 | os dois testes R4 |
| R5 aceita até 1 cupom, recusa 2 ou mais | 0, 2 | teste R5 |
| R6 sem linhas recusa | 0, 2 | teste R6 |
| R7 registro, snake_case, pt_BR/en | 0, 1, 2, 3, 4 | os dois testes de "registro no config" + `tsc` + dashboard |

## O que o verde não prova

Fora do escopo desta spec (Desafio N3), como diz a seção de mesmo nome do `SPEC.md`.

- **As actions nativas continuam aceitando qualquer percentual.** O teto vale só para `desconto_percentual_com_teto`. A `order_percentage_discount` nativa (e as demais) segue no config, e um admin pode cadastrar com ela uma promoção de 100%, como no INC-2022-07.
- **Duas promoções podem somar no mesmo pedido.** O teto é de cada execução da action, não do pedido. Duas promoções ativas (por exemplo, esta com 30% e uma nativa automática) podem passar de 30% no total. A `cupom_unico` limita cupons, não promoções sem cupom.

## Perguntas abertas

Nenhuma. Todas respondidas.
