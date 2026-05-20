import {
    type PaymentRequest,
    type PaymentResponse,
    type PaymentService,
} from '@/Application/Ports/Gateways/mod.ts';

const CHANCE_OF_SUCCESS = 0.9;

export class OnlinePaymentService implements PaymentService {
    pay(request: PaymentRequest): Promise<PaymentResponse> {
        const success = Math.random() < CHANCE_OF_SUCCESS;

        console.log(`Paying ${request.amount} online via ${request.paymentMethod}`);
        console.log('Payment successful?', success ? 'yes' : 'no');

        return Promise.resolve({
            success,
            failureReason: success ? undefined : 'Payment declined by provider',
        });
    }
}
