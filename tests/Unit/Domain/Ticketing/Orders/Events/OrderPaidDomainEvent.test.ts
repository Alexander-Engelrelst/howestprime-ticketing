import { assertEquals } from '@std/assert';
import { OrderPaidDomainEvent } from '@/Domain/Ticketing/Orders/mod.ts';

Deno.test('[Unit] - OrderPaidDomainEvent - create - exposes order details and fqdn', () => {
    // Arrange & Act
    const event = OrderPaidDomainEvent.create('order-1', 'booking-1');

    // Assert
    assertEquals(event.FQDN.value, 'howestprime.ticketing.order.orderpaid');
    assertEquals(event.orderId, 'order-1');
    assertEquals(event.bookingId, 'booking-1');
    assertEquals(event.occurredOn instanceof Date, true);
});