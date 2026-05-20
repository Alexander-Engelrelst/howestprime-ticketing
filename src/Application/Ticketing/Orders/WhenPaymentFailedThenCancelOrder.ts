import { Logger, Policy, UseCase } from '@/Application/Ports/mod.ts';
import { PaymentFailedDomainEvent } from '@/Domain/Ticketing/Payments/mod.ts';
import { CancelOrderUseCaseInput } from '@/Application/Ticketing/Orders/mod.ts';

export class WhenPaymentFailedThenCancelOrder implements Policy<PaymentFailedDomainEvent> {
    constructor(
        private readonly _logger: Logger,
        private readonly _cancelOrder: UseCase<CancelOrderUseCaseInput, void>,
    ) {}

    async handle(event: PaymentFailedDomainEvent): Promise<void> {
        this._logger.debug('Handling payment failed event for order', {
            orderId: event.orderId,
        });

        const input: CancelOrderUseCaseInput = {
            orderId: event.orderId,
        };
        await this._cancelOrder.execute(input);
    }
}
