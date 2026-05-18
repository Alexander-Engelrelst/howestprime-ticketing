import { Logger, UnitOfWork, UseCase } from '@/Application/Ports/mod.ts';
import { CardNumber, CVV, ExpiryDate, Payment, PaymentAmount, PaymentId, PaymentMethod } from '@/Domain/Ticketing/Payments/mod.ts';
import { ExternalId } from '@/Domain/Shared/mod.ts';
import { IllegalArgumentException } from '@domaincrafters/std';
import { BookingId, Order, OrderId, OrderRepository } from '@/Domain/Ticketing/Orders/mod.ts';
import { PaymentService } from '@/Application/Ports/Gateways/mod.ts';
import { OrderNotFoundApplicationException } from '@/Application/Shared/mod.ts';


export interface PayOrderUseCaseInput {
    orderId: string;
    externalId: string;
    paymentMethod: string;
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    amount: number;
    bookingId: string;
}

export class PayOrderUseCase implements UseCase<PayOrderUseCaseInput, string> {
    constructor(
        private readonly _unitOfWork: UnitOfWork,
        private readonly _logger: Logger,
        private readonly _paymentService: PaymentService
    ) {}

    async execute(input: PayOrderUseCaseInput): Promise<string> {
        this._logger.debug('Processing payment for order', { input });

        return await this._unitOfWork.do(async () => {
            // TODO(alexander): ask how to handle this properly
            if (!Object.values(PaymentMethod).includes(input.paymentMethod as PaymentMethod)) {
                throw new IllegalArgumentException(`Unsupported payment method: ${input.paymentMethod}`);
            }

            const orderId = OrderId.create(input.orderId);
            
            const orderOpt = await this._unitOfWork.getRepository<OrderRepository>(Order.name).byId(orderId);

            if (!orderOpt.isPresent) {
                throw new OrderNotFoundApplicationException(orderId.value);
            }

            const payment = Payment.create(
                PaymentId.create(),
                ExternalId.create(input.externalId),
                input.paymentMethod as PaymentMethod,
                CardNumber.create(input.cardNumber),
                ExpiryDate.create(input.expiryDate),
                CVV.create(input.cvv),
                orderId,
                BookingId.create(input.bookingId),
                PaymentAmount.create(input.amount)
            );

            await this._unitOfWork.save<PaymentId>(payment);

            const paymentResult = await this._paymentService.pay({
                amount: payment.amount.value,
                cardNumber: payment.cardNumber.value,
                cvv: payment.cvv.value,
                expiryDate: payment.expiryDate.value,
                paymentMethod: payment.paymentMethod,
            });

            if (paymentResult.success) {
                payment.markAsSuccess();
            } else {
                payment.markAsFailed(paymentResult.failureReason ?? 'Unknown error');
            }

            await this._unitOfWork.save<PaymentId>(payment);

            this._logger.info('Payment processed for order', {
                orderId: payment.orderId.value,
                paymentId: payment.id.value,
                status: payment.status
            });

            return payment.id.value;
        })
    }
}