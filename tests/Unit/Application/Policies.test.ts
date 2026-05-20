import { assertEquals } from '@std/assert';
import { domainEventPolicies } from '@/Application/Policies.ts';
import { PaymentFailedDomainEvent, PaymentSucceededDomainEvent } from '@/Domain/Ticketing/Payments/mod.ts';
import { OrderPaidDomainEvent } from '@/Domain/Ticketing/Orders/mod.ts';

Deno.test('[Unit] - domainEventPolicies - maps payment failed to cancel order policy', () => {
    const paymentFailedPolicies = domainEventPolicies.get(PaymentFailedDomainEvent.FQDN_VALUE.toString());
    const paymentSucceededPolicies = domainEventPolicies.get(PaymentSucceededDomainEvent.FQDN_VALUE.toString());
    const orderPaidPolicies = domainEventPolicies.get(OrderPaidDomainEvent.FQDN_VALUE.toString());

    assertEquals(paymentFailedPolicies, ['WhenPaymentFailedThenCancelOrder']);
    assertEquals(paymentSucceededPolicies, ['WhenPaymentSucceededThenMarkOrderAsPaid']);
    assertEquals(orderPaidPolicies, ['WhenOrderPaidThenReleaseTickets']);
});