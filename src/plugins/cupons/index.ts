import { PluginCommonModule, RuntimeVendureConfig, VendurePlugin } from '@vendure/core';

import { cupomUnico } from './cupom-unico';
import { descontoPercentualComTeto } from './desconto-percentual-com-teto';

export { cupomUnico } from './cupom-unico';
export { descontoPercentualComTeto, TETO_PCT } from './desconto-percentual-com-teto';

// Acrescenta no fim das listas, sem remover nem reordenar as nativas.
export function configurarCupons(config: RuntimeVendureConfig): RuntimeVendureConfig {
    return {
        ...config,
        promotionOptions: {
            ...config.promotionOptions,
            promotionActions: [...(config.promotionOptions.promotionActions ?? []), descontoPercentualComTeto],
            promotionConditions: [...(config.promotionOptions.promotionConditions ?? []), cupomUnico],
        },
    };
}

@VendurePlugin({
    imports: [PluginCommonModule],
    configuration: configurarCupons,
})
export class CuponsPlugin {}
