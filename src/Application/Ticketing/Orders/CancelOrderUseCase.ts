import { Order, OrderId, OrderRepository } from '@/Domain/Ticketing/Orders/mod.ts';
import { Logger, UnitOfWork, UseCase } from '@/Application/Ports/mod.ts';

export interface CancelOrderUseCaseInput {
    orderId: string;
}

export class CancelOrderUseCase implements UseCase<CancelOrderUseCaseInput, void> {
    constructor(
        private readonly _unitOfWork: UnitOfWork,
        private readonly _logger: Logger,
    ) {}

    async execute(input: CancelOrderUseCaseInput): Promise<void> {
        this._logger.debug('Cancelling order', {
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
            order.cancel();
            await this._unitOfWork.save(order);

            this._logger.info('Order cancelled', {
                orderId: input.orderId,
            });
        });
    }
}
