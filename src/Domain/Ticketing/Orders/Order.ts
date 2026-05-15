import { AggregateRoot, Money, UUIDEntityId } from '@/Domain/Shared/mod.ts';
import {
    BookingId,
    CannotAcceptTermsForNonOpenOrderException,
    CannotSubmitCustomerInfoForNonOpenOrderException,
    Customer,
    CustomerMustAgreeToTermsException,
    InvalidOrderStateTransitionException,
    InvalidTicketAmountException,
    Ticket,
} from '@/Domain/Ticketing/Orders/mod.ts';
import { Optional } from '@domaincrafters/std';

export enum OrderStatus {
    Open = 'open',
    Paid = 'paid',
    TicketReleased = 'ticketReleased',
    Cancelled = 'cancelled',
}
export class OrderId extends UUIDEntityId {
    private constructor(id?: string) {
        super(id);
    }

    static create(value?: string): OrderId {
        return new OrderId(value);
    }
}

export class Order extends AggregateRoot<OrderId> {
    private readonly _bookingId: BookingId;
    private _customer: Optional<Customer>;
    private _status: OrderStatus;
    private _agreeToTerms: boolean;
    private readonly _price: Money;
    private readonly _tickets: Ticket[];

    private constructor(
        id: OrderId,
        bookingId: BookingId,
        customer: Optional<Customer>,
        price: Money,
        status: OrderStatus,
        agreeToTerms: boolean,
        tickets: Ticket[],
    ) {
        super(id);
        this._bookingId = bookingId;
        this._customer = customer;
        this._price = price;
        this._status = status;
        this._agreeToTerms = agreeToTerms;
        this._tickets = tickets;
    }

    static create(
        id: OrderId,
        bookingId: BookingId,
        tickets: Ticket[],
    ): Order {
        const price = Money.create(
            tickets.reduce((total, ticket) => total + ticket.price.value, 0),
        );

        const order = new Order(
            id,
            bookingId,
            Optional.empty<Customer>(),
            price,
            OrderStatus.Open,
            false,
            tickets,
        );

        order.validate();
        return order;
    }

    get bookingId(): BookingId {
        return this._bookingId;
    }

    get customer(): Optional<Customer> {
        return this._customer;
    }

    get price(): Money {
        return this._price;
    }

    get status(): OrderStatus {
        return this._status;
    }

    get agreeToTerms(): boolean {
        return this._agreeToTerms;
    }

    get tickets(): Ticket[] {
        return [...this._tickets];
    }

    private validate(): void {
        if (this._tickets.length === 0) {
            throw new InvalidTicketAmountException();
        }
    }

    public confirmPayment(): void {
        if (!this._agreeToTerms) {
            throw new CustomerMustAgreeToTermsException('confirming payment');
        }

        if (this._status !== OrderStatus.Open) {
            throw new InvalidOrderStateTransitionException(this._status, OrderStatus.Paid);
        }

        this._status = OrderStatus.Paid;
    }

    public cancel(): void {
        if (this._status !== OrderStatus.Open) {
            throw new InvalidOrderStateTransitionException(this._status, OrderStatus.Cancelled);
        }
        this._status = OrderStatus.Cancelled;
    }

    public releaseTickets(): void {
        if (this._status !== OrderStatus.Paid) {
            throw new InvalidOrderStateTransitionException(
                this._status,
                OrderStatus.TicketReleased,
            );
        }
        this._status = OrderStatus.TicketReleased;
    }

    public acceptTerms(): void {
        if (this._agreeToTerms) {
            return;
        }

        if (this._status !== OrderStatus.Open) {
            throw new CannotAcceptTermsForNonOpenOrderException();
        }

        this._agreeToTerms = true;
    }

    public assignCustomer(customer: Customer): void {
        if (!this._agreeToTerms) {
            throw new CustomerMustAgreeToTermsException('submitting information');
        }
        if (this._status !== OrderStatus.Open) {
            throw new CannotSubmitCustomerInfoForNonOpenOrderException();
        }

        this._customer = Optional.of<Customer>(customer);
    }
}
