import { LanguageCode, PromotionCondition } from '@vendure/core';

export const cupomUnico = new PromotionCondition({
    code: 'cupom_unico',
    args: {},
    check(ctx, order) {
        return order.lines.length > 0 && order.couponCodes.length <= 1;
    },
    description: [
        { languageCode: LanguageCode.pt_BR, value: 'Pedido com itens e no máximo um cupom' },
        { languageCode: LanguageCode.en, value: 'Order has items and at most one coupon' },
    ],
});
