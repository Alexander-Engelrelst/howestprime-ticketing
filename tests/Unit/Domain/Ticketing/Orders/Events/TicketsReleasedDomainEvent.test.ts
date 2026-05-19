import { assertEquals } from '@std/assert';
import { TicketsReleasedDomainEvent } from '@/Domain/Ticketing/Orders/mod.ts';

Deno.test('[Unit] - TicketsReleasedDomainEvent - create - exposes order, customer, and tickets', () => {
    const event = TicketsReleasedDomainEvent.create('order-1', {
        salutation: 'Mr',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
    }, [
        {
            ticketId: 'ticket-1',
            movieId: 'movie-1',
            room: 'Screen 1',
            seatNumber: 10,
            visitorType: 'standard',
            price: 1500,
            showTime: new Date('2025-06-15T19:30:00Z'),
        },
    ]);

    assertEquals(event.FQDN.value, 'howestprime.ticketing.order.ticketsreleased');
    assertEquals(event.orderId, 'order-1');
    assertEquals(event.customer?.email, 'john@example.com');
    assertEquals(event.tickets.length, 1);
    assertEquals(event.tickets[0]?.ticketId, 'ticket-1');
    assertEquals(event.tickets[0]?.showTime instanceof Date, true);
    assertEquals(event.occurredOn instanceof Date, true);
});