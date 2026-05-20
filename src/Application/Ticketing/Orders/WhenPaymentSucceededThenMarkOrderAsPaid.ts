import { Logger, Policy, UseCase } from '@/Application/Ports/mod.ts';
import { PaymentSucceededDomainEvent } from '@/Domain/Ticketing/Payments/mod.ts';
import { MarkOrderAsPaidUseCaseInput } from '@/Application/Ticketing/Orders/mod.ts';

export class WhenPaymentSucceededThenMarkOrderAsPaid
    implements Policy<PaymentSucceededDomainEvent> {
    constructor(
        private readonly _logger: Logger,
        private readonly _markOrderAsPaid: UseCase<MarkOrderAsPaidUseCaseInput, void>,
    ) {}

    async handle(event: PaymentSucceededDomainEvent): Promise<void> {
        this._logger.debug('Handling payment succeeded event for order', {
            orderId: event.orderId,
        });

        const input: MarkOrderAsPaidUseCaseInput = {
            orderId: event.orderId,
        };
        await this._markOrderAsPaid.execute(input);
    }
}
