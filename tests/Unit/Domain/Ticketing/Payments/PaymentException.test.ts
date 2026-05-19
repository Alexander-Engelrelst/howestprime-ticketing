import { assertEquals, assertInstanceOf } from '@std/assert';
import { DomainException } from '@/Domain/Shared/mod.ts';
import {
    InvalidPaymentStatusTransitionException,
    PaymentStatus,
} from '@/Domain/Ticketing/Payments/mod.ts';

Deno.test('[Unit] - Payment Exceptions - InvalidPaymentStatusTransitionException - formats message correctly', () => {
    const error = new InvalidPaymentStatusTransitionException(PaymentStatus.Pending, PaymentStatus.Success);

    assertInstanceOf(error, DomainException);
    assertEquals(
        error.message,
        "Cannot transition payment status from 'Pending' to 'Success'. Transitions are only allowed when the payment is currently 'pending'.",
    );
});
