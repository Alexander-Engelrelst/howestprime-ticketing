import { Logger, Policy, UnitOfWork } from '@/Application/Ports/mod.ts';
import { PaymentSucceededDomainEvent } from '@/Domain/Ticketing/Payments/mod.ts';
import { Order, OrderId, OrderRepository } from '@/Domain/Ticketing/Orders/mod.ts';

export class WhenPaymentSucceededThenMarkOrderAsPaid
    implements Policy<PaymentSucceededDomainEvent> {
    constructor(
        private readonly _unitOfWork: UnitOfWork,
        private readonly _logger: Logger) {}

    async handle(event: PaymentSucceededDomainEvent): Promise<void> {
        this._logger.debug('Handling payment succeeded event for order', {
            orderId: event.orderId,
        });

        await this._unitOfWork.do(async () => {
        const orderRepository = this._unitOfWork.getRepository<OrderRepository>(Order.name);
        const orderOpt = await orderRepository.byId(OrderId.create(event.orderId));
        

        if (!orderOpt.isPresent) {
            this._logger.error('Order not found', {
                orderId: event.orderId,
            });
            // for simplicity no rollback mechanism is implemented
            return;
        }

        const order = orderOpt.value;
        order.confirmPayment();
        await this._unitOfWork.save(order);

        this._logger.info('Order marked as paid', {
            orderId: event.orderId,
        });
    });
    }
}