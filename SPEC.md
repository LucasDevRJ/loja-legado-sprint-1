# Spec: cupom com teto de 30%

## Contexto
- No ano de 2022, houve um cupom de 100% de desconto, que causou um prejuízo de R$ 40.000,00 (INC-2022-07), por isso o financeiro quer um teto de 30%. A Promotion nativa do Vendure já faz cupom com validade de limite de uso. Faltando somente a regra do teto e a de um cupom por pedido.

## Objetivo
- Plugin em src/plugins/cupons/ com uma action e uma condition novas, registradas sem remover as nativas.

## Regras
- Exports em `src/plugins/cupons/index.ts`: `descontoPercentualComTeto`, `cupomUnico` e `configurarCupons` (nomes exigidos pelo teste).
- **R1:**	Action desconto_percentual_com_teto com argumento pct. 10% de R$100 = -1000; teto de 30%, então pct 50 dá -3000 `pct` é inteiro (tipo `int`).
- **R2:**	Centavos inteiros com Math.round (10% de 3333 = -333)
- **R3:**	Nunca devolve valor positivo
- **R4:**	A base é subTotalWithTax se ctx.channel.pricesIncludeTax, senão subTotal
- **R5:**	Condition cupom_unico: aceita até 1 cupom e recusa 2 ou mais.
- **R6:**	cupom_unico recusa pedido sem linhas
- **R7:**	configurarCupons(config) acrescenta a action e a condition às nativas, sem remover nada; code em snake_case; description em pt_BR e en

## Restrições
- Não alterar test/cupom.test.ts para fazer o teste passar.
- Não criar entidade, resolver, endpoint nem migration: usar Promotion, couponCode e usageLimit nativos.
- Não mexer em src/misc/preco.ts.
- Não instalar nem atualizar dependências (package.json e package-lock.json intocados).
- Não remover nem alterar as actions e conditions nativas do Vendure.
- Tocar só em `src/plugins/cupons/` e `src/vendure-config.ts` (removendo o TODO de cupons da linha 67). `test/cupom.test.ts` vem do gabarito e não é editado.

## Critério de aceite
- os 10 testes de test/cupom.test.ts, da PO na branch gabarito, passam sem nenhuma alteração no teste, e o restante da suíte continua verde.

## Verificação
- npm test && npx tsc --noEmit

## O que o verde não prova
- As actions nativas (`order_percentage_discount` etc.) continuam aceitando qualquer percentual, e duas promoções podem somar no mesmo pedido. Fora do escopo desta spec (Desafio N3).