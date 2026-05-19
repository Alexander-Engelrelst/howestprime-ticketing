import { assertEquals, assertThrows } from '@std/assert';
import { ExternalId } from '@/Domain/Shared/mod.ts';
import {
    BookingId,
    OrderId,
} from '@/Domain/Ticketing/Orders/mod.ts';
import {
    CardNumber,
    CVV,
    ExpiryDate,
    InvalidPaymentStatusTransitionException,
    Payment,
    PaymentAmount,
    PaymentFailedDomainEvent,
    PaymentId,
    PaymentMethod,
    PaymentStatus,
    PaymentSucceededDomainEvent,
} from '@/Domain/Ticketing/Payments/mod.ts';

function createPayment(): Payment {
    return Payment.create(
        PaymentId.create('550e8400-e29b-41d4-a716-446655440000'),
        ExternalId.create('ext-001'),
        PaymentMethod.CreditCard,
        CardNumber.create('4111111111111111'),
        ExpiryDate.create('12/30'),
        CVV.create('123'),
        OrderId.create('550e8400-e29b-41d4-a716-446655440001'),
        BookingId.create('550e8400-e29b-41d4-a716-446655440002'),
        PaymentAmount.create(1500),
    );
}

Deno.test('[Unit] - Payment - create - returns pending payment with supplied details', () => {
    const payment = createPayment();

    assertEquals(payment.status, PaymentStatus.Pending);
    assertEquals(payment.externalId.value, 'ext-001');
    assertEquals(payment.paymentMethod, PaymentMethod.CreditCard);
    assertEquals(payment.cardNumber.value, '4111111111111111');
    assertEquals(payment.expiryDate.value, '12/30');
    assertEquals(payment.cvv.value, '123');
    assertEquals(payment.amount.value, 1500);
});

Deno.test('[Unit] - Payment - markAsSuccess - pending payment - updates status and raises success event', () => {
    const payment = createPayment();

    payment.markAsSuccess();

    assertEquals(payment.status, PaymentStatus.Success);
    assertEquals(payment.hasDomainEvents(), true);

    const events = payment.pullDomainEvents();
    assertEquals(events.length, 1);
    const event = events[0] as PaymentSucceededDomainEvent;
    assertEquals(event.paymentId, payment.id.value);
    assertEquals(event.orderId, payment.orderId.value);
    assertEquals(event.bookingId, payment.bookingId.value);
    assertEquals(payment.hasDomainEvents(), false);
});

Deno.test('[Unit] - Payment - markAsFailed - pending payment - updates status and raises failed event', () => {
    const payment = createPayment();

    payment.markAsFailed('Insufficient funds');

    assertEquals(payment.status, PaymentStatus.Failed);
    assertEquals(payment.hasDomainEvents(), true);

    const events = payment.pullDomainEvents();
    assertEquals(events.length, 1);
    const event = events[0] as PaymentFailedDomainEvent;
    assertEquals(event.paymentId, payment.id.value);
    assertEquals(event.orderId, payment.orderId.value);
    assertEquals(event.bookingId, payment.bookingId.value);
    assertEquals(event.reason, 'Insufficient funds');
    assertEquals(payment.hasDomainEvents(), false);
});

Deno.test('[Unit] - Payment - markAsSuccess - non-pending payment - throws InvalidPaymentStatusTransitionException', () => {
    const payment = createPayment();
    payment.markAsFailed('Insufficient funds');

    assertThrows(
        () => payment.markAsSuccess(),
        InvalidPaymentStatusTransitionException,
        "Cannot transition payment status from 'Failed' to 'Success'. Transitions are only allowed when the payment is currently 'pending'.",
    );
});

Deno.test('[Unit] - Payment - markAsFailed - non-pending payment - throws InvalidPaymentStatusTransitionException', () => {
    const payment = createPayment();
    payment.markAsSuccess();

    assertThrows(
        () => payment.markAsFailed('another reason'),
        InvalidPaymentStatusTransitionException,
        "Cannot transition payment status from 'Success' to 'Failed'. Transitions are only allowed when the payment is currently 'pending'.",
    );
});
