import { EventFQDN } from '@/Domain/Shared/mod.ts';
import { OrderDomainEvent } from './OrderDomainEvent.ts';

export interface TicketsReleasedCustomerData {
    salutation: string;
    firstName: string;
    lastName: string;
    email: string;
}

export interface TicketsReleasedTicketData {
    ticketId: string;
    movieId: string;
    room: string;
    seatNumber: number;
    visitorType: string;
    price: number;
    showTime: Date;
}

export class TicketsReleasedDomainEvent extends OrderDomainEvent {
    static readonly FQDN_VALUE = EventFQDN.create(
        `${OrderDomainEvent.FQDN_PREFIX}.ticketsreleased`,
    );

    private readonly _orderId: string;
    private readonly _customer: TicketsReleasedCustomerData | null;
    private readonly _tickets: TicketsReleasedTicketData[];
    private readonly _occurredOn: Date;

    private constructor(
        orderId: string,
        customer: TicketsReleasedCustomerData | null,
        tickets: TicketsReleasedTicketData[],
    ) {
        super();
        this._orderId = orderId;
        this._customer = customer;
        this._tickets = tickets;
        this._occurredOn = new Date();
    }

    static create(
        orderId: string,
        customer: TicketsReleasedCustomerData | null,
        tickets: TicketsReleasedTicketData[],
    ): TicketsReleasedDomainEvent {
        return new TicketsReleasedDomainEvent(orderId, customer, tickets);
    }

    override get FQDN(): EventFQDN {
        return TicketsReleasedDomainEvent.FQDN_VALUE;
    }

    override get occurredOn(): Date {
        return this._occurredOn;
    }

    get orderId(): string {
        return this._orderId;
    }

    get customer(): TicketsReleasedCustomerData | null {
        return this._customer;
    }

    get tickets(): TicketsReleasedTicketData[] {
        return [...this._tickets];
    }
}
