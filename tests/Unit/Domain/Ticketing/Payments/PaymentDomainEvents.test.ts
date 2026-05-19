import { assertEquals } from '@std/assert';
import {
    PaymentFailedDomainEvent,
    PaymentSucceededDomainEvent,
} from '@/Domain/Ticketing/Payments/mod.ts';

Deno.test('[Unit] - PaymentSucceededDomainEvent - create - exposes payment details and fqdn', () => {
    const event = PaymentSucceededDomainEvent.create('payment-1', 'order-1', 'booking-1');

    assertEquals(event.FQDN.value, 'howestprime.ticketing.payment.paymentsuccess');
    assertEquals(event.paymentId, 'payment-1');
    assertEquals(event.orderId, 'order-1');
    assertEquals(event.bookingId, 'booking-1');
    assertEquals(event.occurredOn instanceof Date, true);
});

Deno.test('[Unit] - PaymentFailedDomainEvent - create - exposes payment details, reason and fqdn', () => {
    const event = PaymentFailedDomainEvent.create('payment-2', 'order-2', 'booking-2', 'Insufficient funds');

    assertEquals(event.FQDN.value, 'howestprime.ticketing.payment.paymentfailed');
    assertEquals(event.paymentId, 'payment-2');
    assertEquals(event.orderId, 'order-2');
    assertEquals(event.bookingId, 'booking-2');
    assertEquals(event.reason, 'Insufficient funds');
    assertEquals(event.occurredOn instanceof Date, true);
});
