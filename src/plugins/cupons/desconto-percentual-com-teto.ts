import { LanguageCode, PromotionOrderAction } from '@vendure/core';

// Teto pedido pelo financeiro depois do INC-2022-07 (cupom de 100%).
export const TETO_PCT = 30;

export const descontoPercentualComTeto = new PromotionOrderAction({
    code: 'desconto_percentual_com_teto',
    args: {
        pct: {
            type: 'int',
            ui: { component: 'number-form-input', suffix: '%', min: 0, max: TETO_PCT },
        },
    },
    execute(ctx, order, args) {
        const base = ctx.channel.pricesIncludeTax ? order.subTotalWithTax : order.subTotal;
        // Arg vazio vira NaN no parseInt: trata como 0 para nunca devolver NaN.
        const pctInformado = Number.isFinite(args.pct) ? args.pct : 0;
        const pct = Math.min(Math.max(pctInformado, 0), TETO_PCT);
        // Arredonda uma vez, sobre o valor positivo, e só depois nega.
        const desconto = Math.round((base * pct) / 100);
        return desconto === 0 ? 0 : -desconto;
    },
    description: [
        { languageCode: LanguageCode.pt_BR, value: 'Desconto de { pct }% no pedido (máximo 30%)' },
        { languageCode: LanguageCode.en, value: 'Discount order by { pct }% (capped at 30%)' },
    ],
});
