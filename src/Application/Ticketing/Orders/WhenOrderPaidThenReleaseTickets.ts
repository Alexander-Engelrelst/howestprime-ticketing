import { Logger, Policy, UseCase } from '@/Application/Ports/mod.ts';
import { OrderPaidDomainEvent } from '@/Domain/Ticketing/Orders/mod.ts';
import { ReleaseTicketUseCaseInput } from '@/Application/Ticketing/Orders/mod.ts';

export class WhenOrderPaidThenReleaseTickets
    implements Policy<OrderPaidDomainEvent> {
    constructor(
        private readonly _logger: Logger,
        private readonly _releaseTicket: UseCase<ReleaseTicketUseCaseInput, void>,
    ) {}

    async handle(event: OrderPaidDomainEvent): Promise<void> {
        this._logger.debug('Handling order paid event for order', {
            orderId: event.orderId,
        });

        const input : ReleaseTicketUseCaseInput = {
            orderId: event.orderId,
        };
        await this._releaseTicket.execute(input);
    }
}
