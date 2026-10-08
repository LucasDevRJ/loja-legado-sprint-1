Objetivo:
- Um cupom `FRETEGRATIS` que zera o frete de pedidos a partir de R$ 200,00.

Regra:
- **R1:** promoção nativa com couponCode, condition minimum_order_amount e action free_shipping.
- **R2:** valor mínimo de 20000 centavos (R$ 200,00), o mesmo do relatório, calculado sem imposto (`taxInclusive: false`).
- **R3:** não acumula com outro cupom (condition `cupom_unico`).
- **R4:** A definição fica em src/plugins/cupons/frete-gratis.ts; a promoção é criada pelo admin no dashboard. Não gravar no banco automaticamente.
- **R5:** o teste cobre R$ 199,99, R$ 200,00 e 2 cupons.
- **R6:** com dois cupons, o frete grátis não se aplica.
- **R7:** o financeiro sabe que o relatório e a loja vão divergir.
- **R8:** Mova para uma seção final "Perguntas de negócio"

Restrição (o que NÃO fazer):
- não criar action ou condition nova, nem usar ou alterar o frete() de src/misc/preco.ts

Critério de aceite (verificável):
- Pedido de R$ 199,99 com o cupom: frete normal. Pedido de R$ 200,00 com o cupom: frete 0.

Verificação (comando):
- npm test com test/frete-gratis.test.ts verde

Perguntas de negócio:
- O relatório (`frete()` em `src/misc/preco.ts`) não considera o cupom: o financeiro aceita que relatório e loja divirjam?