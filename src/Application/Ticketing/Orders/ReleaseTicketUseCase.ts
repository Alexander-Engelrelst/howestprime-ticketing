import { Order, OrderId, OrderRepository } from '@/Domain/Ticketing/Orders/mod.ts';
import { Logger, UnitOfWork, UseCase } from '@/Application/Ports/mod.ts';

export interface ReleaseTicketUseCaseInput {
    orderId: string;
}

export class ReleaseTicketUseCase implements UseCase<ReleaseTicketUseCaseInput, void> {
    constructor(
        private readonly _unitOfWork: UnitOfWork,
        private readonly _logger: Logger,
    ) {}

    async execute(input: ReleaseTicketUseCaseInput): Promise<void> {
        this._logger.debug('Releasing ticket', {
            orderId: input.orderId,
        });

        await this._unitOfWork.do(async () => {
            const orderRepository = this._unitOfWork.getRepository<OrderRepository>(Order.name);
            const orderOpt = await orderRepository.byId(OrderId.create(input.orderId));

            if (!orderOpt.isPresent) {
                this._logger.error('Order not found', {
                    orderId: input.orderId,
                });

                return;
            }

            const order = orderOpt.value;

            // for simplicity no rollback is implemented if releasing fails
            order.releaseTickets();
            await this._unitOfWork.save(order);

            this._logger.info('Ticket released', {
                orderId: input.orderId,
            });
        });
    }
}
