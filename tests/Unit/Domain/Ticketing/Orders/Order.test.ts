import { assertEquals, assertThrows } from '@std/assert';

import { Money } from '@/Domain/Shared/mod.ts';
import { BookingId, CannotAcceptTermsForNonOpenOrderException, CannotSubmitCustomerInfoForNonOpenOrderException, Customer, CustomerMustAgreeToTermsException, InvalidOrderStateTransitionException, InvalidTicketAmountException, Order, OrderId, OrderStatus, Ticket } from '@/Domain/Ticketing/Orders/mod.ts';

// Helper to create a dummy ticket
const createMockTicket = (priceValue: number): Ticket => {
    return {
        price: Money.create(priceValue)
    } as Ticket;
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