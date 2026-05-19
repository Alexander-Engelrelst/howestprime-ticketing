import { Order, OrderId, OrderRepository } from '@/Domain/Ticketing/Orders/mod.ts';
import { Logger, UnitOfWork, UseCase } from '@/Application/Ports/mod.ts';

export interface MarkOrderAsPaidUseCaseInput {
    orderId: string;
}

export class MarkOrderAsPaidUseCase implements UseCase<MarkOrderAsPaidUseCaseInput, void> {
    constructor(
        private readonly _unitOfWork: UnitOfWork,
        private readonly _logger: Logger,
    ) {}

    async execute(input: MarkOrderAsPaidUseCaseInput): Promise<void> {
        await this._unitOfWork.do(async () => {
            this._logger.debug('Marking order as paid', {
                orderId: input.orderId,
            });

            const orderRepository = this._unitOfWork.getRepository<OrderRepository>(Order.name);
            const orderOpt = await orderRepository.byId(OrderId.create(input.orderId));

            if (!orderOpt.isPresent) {
                this._logger.error('Order not found', {
                    orderId: input.orderId,
                });
                // for simplicity no rollback mechanism is implemented
                return;
            }

            const order = orderOpt.value;
            order.confirmPayment();
            await this._unitOfWork.save(order);

            this._logger.info('Order marked as paid', {
                orderId: input.orderId,
            });
        });
    }
}
