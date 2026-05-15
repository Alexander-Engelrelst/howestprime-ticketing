import { assertEquals, assertInstanceOf } from '@std/assert';

import { CannotAcceptTermsForNonOpenOrderException, CannotSubmitCustomerInfoForNonOpenOrderException, CustomerMustAgreeToTermsException, InvalidOrderStateTransitionException, InvalidTicketAmountException, OrderStatus, TicketQuantityMismatchException } from '@/Domain/Ticketing/Orders/mod.ts';
import { DomainException } from '@domaincrafters/std';

Deno.test('[Unit] - Order Exceptions - InvalidOrderStateTransitionException', () => {
    const error = new InvalidOrderStateTransitionException(OrderStatus.Open, OrderStatus.Paid);
    
    assertInstanceOf(error, DomainException);
    assertEquals(error.message, "Cannot transition order from 'open' to 'paid'");
});

Deno.test('[Unit] - Order Exceptions - InvalidTicketAmountException', () => {
    const error = new InvalidTicketAmountException();
    
    assertInstanceOf(error, DomainException);
    assertEquals(error.message, 'Order must contain at least one ticket');
});

Deno.test('[Unit] - Order Exceptions - CustomerMustAgreeToTermsException', () => {
    const intent = 'completing payment';
    const error = new CustomerMustAgreeToTermsException(intent);
    
    assertInstanceOf(error, DomainException);
    assertEquals(error.message, `Customer must agree to terms before ${intent}.`);
});

Deno.test('[Unit] - Order Exceptions - CannotAcceptTermsForNonOpenOrderException', () => {
    const error = new CannotAcceptTermsForNonOpenOrderException();
    
    assertInstanceOf(error, DomainException);
    assertEquals(error.message, 'Terms can only be accepted for orders in open state.');
});

Deno.test('[Unit] - Order Exceptions - CannotSubmitCustomerInfoForNonOpenOrderException', () => {
    const error = new CannotSubmitCustomerInfoForNonOpenOrderException();
    
    assertInstanceOf(error, DomainException);
    assertEquals(error.message, 'Customer information can only be submitted for orders in open state.');
});

Deno.test('[Unit] - Order Exceptions - TicketQuantityMismatchException', () => {
    const error = new TicketQuantityMismatchException(5, 3);
    
    assertInstanceOf(error, DomainException);
    assertEquals(error.message, 'The total amount of tickets (3) must match the number of seats (5).');
});