import { OrderStatus } from '@/Domain/Ticketing/Orders/mod.ts';
import { DomainException } from '@domaincrafters/std';

export class InvalidOrderStateTransitionException extends DomainException {
    constructor(currentState: OrderStatus, attemptedState: OrderStatus) {
        super(`Cannot transition order from '${currentState}' to '${attemptedState}'`);
    }
}

export class InvalidTicketAmountException extends DomainException {
    constructor() {
        super('Order must contain at least one ticket');
    }
}

export class CustomerMustAgreeToTermsException extends DomainException {
    constructor(intent: string) {
        super(`Customer must agree to terms before ${intent}.`);
    }
}

export class CannotAcceptTermsForNonOpenOrderException extends DomainException {
    constructor() {
        super('Terms can only be accepted for orders in open state.');
    }
}

export class CannotSubmitCustomerInfoForNonOpenOrderException extends DomainException {
    constructor() {
        super('Customer information can only be submitted for orders in open state.');
    }
}