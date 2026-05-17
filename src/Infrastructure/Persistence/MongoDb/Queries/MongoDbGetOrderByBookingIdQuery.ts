import { type Collection, type Document, type Filter } from '@mongodb';
import { Optional } from '@domaincrafters/std';

import type {
GetOrderByBookingIdQueryPort,
    OrderByBookingIdCustomerReadModel,
    OrderByBookingIdReadModel,
    OrderByBookingIdTicketReadModel,
    SuggestionByIdReadModel,
} from '@/Application/Ports/Queries/mod.ts';
import { MongoDbClient } from '@/Infrastructure/Persistence/MongoDb/Shared/mod.ts';

export class MongoDbGetOrderByBookingIdQuery implements GetOrderByBookingIdQueryPort {
    private readonly _collection: Collection<Document>;

    constructor(mongoDbClient: MongoDbClient) {
        this._collection = mongoDbClient.collection<Document>('orders');
    }

    async getOrderByBookingId(bookingId: string): Promise<Optional<OrderByBookingIdReadModel>> {
        const filter: Filter<Document> = {
            bookingId: bookingId,
        } as unknown as Filter<Document>;

        const document = await this._collection.findOne(filter);
        if (!document) {
            return Optional.empty<OrderByBookingIdReadModel>();
        }

        return Optional.of<OrderByBookingIdReadModel>(this.mapToReadModel(document));
    }

    private mapToReadModel(document: Document): OrderByBookingIdReadModel {
        const source = this.asRecord(document);
        
        // Handle defensive array processing for nested structural mapping
        const ticketsRaw = Array.isArray(source.tickets) ? source.tickets : [];
        const mappedTickets = ticketsRaw.map((t) => this.mapTicket(t));

        let mappedCustomer = Optional.empty<OrderByBookingIdCustomerReadModel>();
        if (source.customer && typeof source.customer === 'object') {
            mappedCustomer = Optional.of<OrderByBookingIdCustomerReadModel>(this.mapCustomer(source.customer));
        }

        return {
            id: this.asString(source._id ?? source.id),
            bookingId: this.asString(source.bookingId),
            status: this.asString(source.status),
            price: typeof source.price === 'number' ? source.price : 0,
            agreeToTerms: Boolean(source.agreeToTerms),
            customer: mappedCustomer,
            tickets: mappedTickets,
        };
    }

    private mapCustomer(customerData: unknown): OrderByBookingIdCustomerReadModel {
        const c = this.asRecord(customerData);
        return {
            firstName: this.asString(c.firstName),
            lastName: this.asString(c.lastName),
            email: this.asString(c.email),
            salutation: this.asString(c.salutation),
        };
    }

    private mapTicket(ticketData: unknown): OrderByBookingIdTicketReadModel {
        const t = this.asRecord(ticketData);
        const seat = this.asRecord(t.seat);
        const movieInfo = this.asRecord(t.movieInfo);

        return {
            ticketId: this.asString(t.id),
            seatNumber: this.asNumber(seat.seatNumber),
            visitorType: this.asString(seat.visitorType),
            price: this.asNumber(t.price),
            movieId: this.asString(movieInfo.movieId),
            room: this.asString(t.room),
            // Parse safe Date type out of string values stored in MongoDB
            showTime: typeof t.showTime === 'string' || typeof t.showTime === 'number' 
                ? new Date(t.showTime) 
                : new Date(NaN),
        };
    }

    // --- Safe Runtime Helper Utilities ---
    private asRecord(value: unknown): Record<string, unknown> {
        return value !== null && typeof value === 'object' ? value as Record<string, unknown> : {};
    }

    private asString(value: unknown): string {
        if (typeof value === 'string') {
            return value;
        }

        if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
            return String(value);
        }

        if (value !== null && typeof value === 'object') {
            const candidate = value as { toString?: () => string };
            if (typeof candidate.toString === 'function') {
                const serialized = candidate.toString();
                return serialized === '[object Object]' ? '' : serialized;
            }
        }

        return '';
    }

    private asNumber(value: unknown): number {
    if (typeof value === 'number') {
        return Number.isNaN(value) ? 0 : value;
    }

    // 2. If it's a string, try parsing it
    if (typeof value === 'string') {
        const parsed = Number(value);
        return Number.isNaN(parsed) ? 0 : parsed;
    }

    // 3. Fallback safely to 0 for booleans, objects, null, or undefined
    return 0;
}
}
