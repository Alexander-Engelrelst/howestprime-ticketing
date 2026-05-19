import {
    RequestValidator,
    RouterContext,
    WebApiController,
    WebApiResult,
} from '@/Infrastructure/WebApi/Shared/mod.ts';
import { UseCase } from '@/Application/Ports/mod.ts';
import { PayOrderUseCaseInput } from '@/Application/Ticketing/Payments/mod.ts';
import { Guard } from '@domaincrafters/std';

interface PayOrderRequest {
    externalId: string;
    paymentMethod: string;
    paymentDetails: {
        cardNumber: string;
        expiryDate: string;
        cvv: string;
    };
    bookingId: string;
    amount: number;
}

export class PayOrderController implements WebApiController {
    constructor(
        private readonly _payOrderUseCase: UseCase<PayOrderUseCaseInput, string>,
    ) {}

    async handle(ctx: RouterContext<string>): Promise<void> {
        const orderId = this.extractOrderId(ctx);
        const requestBody = await ctx.request.body.json();
        const input = this.mapToUseCaseInput(orderId, requestBody);
        const paymentId = await this._payOrderUseCase.execute(input);

        WebApiResult.created(ctx, `/api/orders/${orderId}/payments/${paymentId}`);
        ctx.response.body = { paymentId };
    }

    private extractOrderId(ctx: RouterContext<string>): string {
        const orderId = ctx.params.orderId;

        const validator = RequestValidator.create([
            () =>
                Guard.check(orderId, 'orderId')
                    .isType('string')
                    .againstWhitespace(),
        ]);

        validator
            .onValidationFailure('invalid order id')
            .validate();

        return orderId as string;
    }

    private mapToUseCaseInput(orderId: string, payload: unknown): PayOrderUseCaseInput {
        const body = PayOrderController.validatePayload(payload);
        return {
            orderId,
            externalId: body.externalId,
            paymentMethod: body.paymentMethod,
            cardNumber: body.paymentDetails.cardNumber,
            expiryDate: body.paymentDetails.expiryDate,
            cvv: body.paymentDetails.cvv,
            amount: body.amount,
            bookingId: body.bookingId,
        };
    }

    private static validatePayload(payload: unknown): PayOrderRequest {
        if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
            throw new Error('Invalid payload format');
        }

        const body = payload as PayOrderRequest;

        const validator = RequestValidator.create([
            () => Guard.check(body.externalId, 'externalId').isType('string').againstEmpty(),
            () => Guard.check(body.paymentMethod, 'paymentMethod').isType('string').againstEmpty(),
            () =>
                Guard.check(body.paymentDetails.cardNumber, 'cardNumber').isType('string')
                    .againstEmpty(),
            () =>
                Guard.check(body.paymentDetails.expiryDate, 'expiryDate').isType('string')
                    .againstEmpty(),
            () => Guard.check(body.paymentDetails.cvv, 'cvv').isType('string').againstEmpty(),
            () => Guard.check(body.bookingId, 'bookingId').isType('string').againstEmpty(),
            () => Guard.check(body.amount, 'amount').isType('number'),
        ]);

        validator
            .onValidationFailure('invalid payment request')
            .validate();

        return body;
    }
}
