import { assertEquals, assertThrows } from '@std/assert';

import { Money } from '@/Domain/Shared/mod.ts';
import {
    BookingId,
    CannotAcceptTermsForNonOpenOrderException,
    CannotSubmitCustomerInfoForNonOpenOrderException,
    Customer,
    CustomerEmail,
    CustomerFirstName,
    CustomerLastName,
    CustomerMustAgreeToTermsException,
    CustomerSalutation,
    InvalidOrderStateTransitionException,
    InvalidTicketAmountException,
    MovieInfo,
    Order,
    OrderId,
    OrderStatus,
    RoomName,
    ShowTime,
    Ticket,
    TicketId,
    TicketMappingService,
    TicketsReleasedDomainEvent,
    VisitorType,
} from '@/Domain/Ticketing/Orders/mod.ts';
import {
    AgeRating,
    Genre,
    MovieDuration,
    MovieId,
    MovieTitle,
    PosterUrl,
} from '@/Domain/Ticketing/Movies/mod.ts';

// Helper to create a dummy ticket
const createMockTicket = (priceValue: number): Ticket => {
    const movieInfo = MovieInfo.create(
        MovieId.create('123e4567-e89b-12d3-a456-426614174000'),
        MovieTitle.create('Inception'),
        MovieDuration.create(148),
        [Genre.create('Action')],
        AgeRating.create(12),
        PosterUrl.create('https://example.com/poster.jpg'),
        Money.create(priceValue),
    );

    const ticket = Object.create(Ticket.prototype);
    ticket['_id'] = TicketId.create();
    ticket['_movieInfo'] = movieInfo;
    ticket['_seat'] = {
        seatNumber: priceValue,
        visitorType: VisitorType.Discounted,
    };
    ticket['_room'] = RoomName.create('Screen 1');
    ticket['_price'] = Money.create(priceValue);
    ticket['_showTime'] = ShowTime.create(new Date('2025-06-15T19:30:00Z'));

    return ticket as Ticket;
};

const createDetailedOrder = (withCustomer: boolean): Order => {
    const movieInfo = MovieInfo.create(
        MovieId.create('123e4567-e89b-12d3-a456-426614174000'),
        MovieTitle.create('Inception'),
        MovieDuration.create(148),
        [Genre.create('Action')],
        AgeRating.create(12),
        PosterUrl.create('https://example.com/poster.jpg'),
        Money.create(1500),
    );

    const tickets = TicketMappingService.mapToTickets(
        [10, 11],
        [{ type: VisitorType.Standard, quantity: 2 }],
        movieInfo,
        RoomName.create('Screen 1'),
        ShowTime.create(new Date('2025-06-15T19:30:00Z')),
    );

    const order = Order.create(
        OrderId.create('550e8400-e29b-41d4-a716-446655440000'),
        BookingId.create('f47ac10b-58cc-4372-a567-0e02b2c3d479'),
        tickets,
    );

    order.acceptTerms();

    if (withCustomer) {
        order.assignCustomer(
            Customer.create(
                CustomerFirstName.create('John'),
                CustomerLastName.create('Doe'),
                CustomerEmail.create('john@example.com'),
                CustomerSalutation.create('Mr.'),
            ),
        );
    }

    order.confirmPayment();
    order.pullDomainEvents();
    return order;
};

Deno.test('[Unit] - Order - create - valid input - calculates total price and sets status to Open', () => {
    // Arrange
    const id = OrderId.create();
    const bookingId = BookingId.create();
    const tickets = [createMockTicket(10), createMockTicket(15)];

    // Act
    const order = Order.create(id, bookingId, tickets);

    // Assert
    assertEquals(order.id.equals(id), true);
    assertEquals(order.price.value, 25);
    assertEquals(order.status, OrderStatus.Open);
    assertEquals(order.agreeToTerms, false);
    assertEquals(order.tickets.length, 2);
    assertEquals(order.bookingId.equals(bookingId), true);
});

Deno.test('[Unit] - Order - create - empty tickets - throws InvalidTicketAmountException', () => {
    assertThrows(
        () => Order.create(OrderId.create(), BookingId.create(), []),
        InvalidTicketAmountException
    );
});

Deno.test('[Unit] - Order - acceptTerms - valid state - sets agreeToTerms to true', () => {
    const order = Order.create(OrderId.create(), BookingId.create(), [createMockTicket(10)]);
    
    order.acceptTerms();
    
    assertEquals(order.agreeToTerms, true);
});

Deno.test('[Unit] - Order - confirmPayment - without terms - throws CustomerMustAgreeToTermsException', () => {
    const order = Order.create(OrderId.create(), BookingId.create(), [createMockTicket(10)]);
    
    assertThrows(
        () => order.confirmPayment(),
        CustomerMustAgreeToTermsException
    );
});

Deno.test('[Unit] - Order - confirmPayment - valid state and terms - transitions to Paid', () => {
    const order = Order.create(OrderId.create(), BookingId.create(), [createMockTicket(10)]);
    order.acceptTerms();
    
    order.confirmPayment();
    
    assertEquals(order.status, OrderStatus.Paid);
});

Deno.test('[Unit] - Order - state transitions - releaseTickets - requires Paid status', async (t) => {
    const order = Order.create(OrderId.create(), BookingId.create(), [createMockTicket(10)]);
    order.acceptTerms();

    await t.step('throws when releasing from Open status', () => {
        assertThrows(() => order.releaseTickets(), InvalidOrderStateTransitionException);
    });

    await t.step('succeeds when status is Paid', () => {
        order.confirmPayment(); // Transition to Paid
        order.releaseTickets(); // Transition to TicketReleased
        assertEquals(order.status, OrderStatus.TicketReleased);
    });
});

Deno.test('[Unit] - Order - releaseTickets - raises TicketsReleasedDomainEvent - without customer', () => {
    const order = createDetailedOrder(false);

    order.releaseTickets();

    const event = order.pullDomainEvents()[0];
    assertEquals(event instanceof TicketsReleasedDomainEvent, true);

    const ticketsReleasedEvent = event as TicketsReleasedDomainEvent;
    assertEquals(ticketsReleasedEvent.orderId, '550e8400-e29b-41d4-a716-446655440000');
    assertEquals(ticketsReleasedEvent.customer, null);
    assertEquals(ticketsReleasedEvent.tickets.length, 2);
    const firstTicket = ticketsReleasedEvent.tickets[0]!;
    assertEquals(firstTicket.ticketId.length > 0, true);
    assertEquals(firstTicket.movieId, '123e4567-e89b-12d3-a456-426614174000');
    assertEquals(firstTicket.room, 'Screen 1');
    assertEquals(firstTicket.seatNumber, 10);
    assertEquals(firstTicket.visitorType, VisitorType.Standard);
});

Deno.test('[Unit] - Order - releaseTickets - raises TicketsReleasedDomainEvent - with customer', () => {
    const order = createDetailedOrder(true);

    order.releaseTickets();

    const event = order.pullDomainEvents()[0];
    assertEquals(event instanceof TicketsReleasedDomainEvent, true);

    const ticketsReleasedEvent = event as TicketsReleasedDomainEvent;
    assertEquals(ticketsReleasedEvent.customer?.salutation, 'Mr.');
    assertEquals(ticketsReleasedEvent.customer?.firstName, 'John');
    assertEquals(ticketsReleasedEvent.customer?.lastName, 'Doe');
    assertEquals(ticketsReleasedEvent.customer?.email, 'john@example.com');
    assertEquals(ticketsReleasedEvent.tickets.length, 2);
});

Deno.test('[Unit] - Order - cancel - valid from Open status', () => {
    const order = Order.create(OrderId.create(), BookingId.create(), [createMockTicket(10)]);
    
    order.cancel();
    
    assertEquals(order.status, OrderStatus.Cancelled);
});

Deno.test('[Unit] - Order - assignCustomer - requires terms and Open status', async (t) => {
    const order = Order.create(OrderId.create(), BookingId.create(), [createMockTicket(10)]);
    const mockCustomer = {} as Customer;

    await t.step('throws when terms not accepted', () => {
        assertThrows(() => order.assignCustomer(mockCustomer), CustomerMustAgreeToTermsException);
    });

    await t.step('succeeds when terms accepted and status Open', () => {
        order.acceptTerms();
        order.assignCustomer(mockCustomer);
        assertEquals(order.customer.isPresent, true);
    });
});

Deno.test('[Unit] - Order - validate (private) - enforces invariants on fake state', () => {
    // We use Object.create to bypass constructor for testing specific invariant logic
    const order = Object.create(Order.prototype);
    
    // Setting invalid state manually to test the validator
    (order as any)._tickets = []; 

    assertThrows(
        () => order['validate'](), 
        InvalidTicketAmountException
    );
});

Deno.test('[Unit] - Order - cancel - from Paid status - throws InvalidOrderStateTransitionException', () => {
    const order = Order.create(OrderId.create(), BookingId.create(), [createMockTicket(10)]);
    order.acceptTerms();
    order.confirmPayment(); // Status is now Paid

    assertThrows(
        () => order.cancel(),
        InvalidOrderStateTransitionException
    );
});

Deno.test('[Unit] - Order - confirmPayment - from Cancelled status - throws InvalidOrderStateTransitionException', () => {
    const order = Order.create(OrderId.create(), BookingId.create(), [createMockTicket(10)]);
    order.acceptTerms(); // Even if terms are accepted, status is Cancelled
    order.cancel();
    assertThrows(
        () => order.confirmPayment(),
        InvalidOrderStateTransitionException
    );
});

Deno.test('[Unit] - Order - acceptTerms - when already accepted - does nothing (idempotent)', () => {
    const order = Order.create(OrderId.create(), BookingId.create(), [createMockTicket(10)]);
    order.acceptTerms();
    
    // Should not throw and remain true
    order.acceptTerms(); 
    assertEquals(order.agreeToTerms, true);
});

Deno.test('[Unit] - Order - acceptTerms - non-Open status - throws CannotAcceptTermsForNonOpenOrderException', () => {
    const order = Order.create(OrderId.create(), BookingId.create(), [createMockTicket(10)]);
    order.cancel();

    assertThrows(
        () => order.acceptTerms(),
        CannotAcceptTermsForNonOpenOrderException
    );
});

Deno.test('[Unit] - Order - assignCustomer - non-Open status - throws CannotSubmitCustomerInfoForNonOpenOrderException', () => {
    const order = Order.create(OrderId.create(), BookingId.create(), [createMockTicket(10)]);
    order.acceptTerms();
    order.confirmPayment(); // Status is Paid

    assertThrows(
        () => order.assignCustomer({} as Customer),
        CannotSubmitCustomerInfoForNonOpenOrderException
    );
});