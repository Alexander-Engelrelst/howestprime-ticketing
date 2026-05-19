import { DomainException } from '@/Domain/Shared/mod.ts';
import { PaymentStatus } from '@/Domain/Ticketing/Payments/mod.ts';

export class InvalidPaymentStatusTransitionException extends DomainException {
    constructor(currentStatus: PaymentStatus, targetStatus: PaymentStatus) {
        super(
            `Cannot transition payment status from '${currentStatus}' to '${targetStatus}'. Transitions are only allowed when the payment is currently 'pending'.`,
        );
    }
}
