import { Entity, Money, UUIDEntityId } from '@/Domain/Shared/mod.ts';
import { MovieInfo, RoomName, Seat, ShowTime, VisitorType } from '@/Domain/Ticketing/Orders/mod.ts';

export class TicketId extends UUIDEntityId {
    static create(value?: string): TicketId {
        return new TicketId(value);
    }

    private constructor(value?: string) {
        super(value);
    }
}

export class Ticket extends Entity<TicketId> {
    private static readonly DISCOUNT_TICKET_PRICE_MULTIPLIER = 0.9;

    private readonly _movieInfo: MovieInfo;
    private readonly _seat: Seat;
    private readonly _room: RoomName;
    private readonly _price: Money;
    private readonly _showTime: ShowTime;

    private constructor(
        id: TicketId,
        movieInfo: MovieInfo,
        seat: Seat,
        room: RoomName,
        price: Money,
        showTime: ShowTime,
    ) {
        super(id);
        this._movieInfo = movieInfo;
        this._seat = seat;
        this._room = room;
        this._price = price;
        this._showTime = showTime;
    }

    static create(
        ticketId: TicketId,
        movieInfo: MovieInfo,
        seat: Seat,
        room: RoomName,
        showTime: ShowTime,
    ): Ticket {
        const price = seat.visitorType === VisitorType.Discounted
            ? Money.fromCents(movieInfo.price.value * Ticket.DISCOUNT_TICKET_PRICE_MULTIPLIER)
            : movieInfo.price;

        return new Ticket(ticketId, movieInfo, seat, room, price, showTime);
    }

    get movieInfo(): MovieInfo {
        return this._movieInfo;
    }

    get seat(): Seat {
        return this._seat;
    }

    get room(): RoomName {
        return this._room;
    }

    get price(): Money {
        return this._price;
    }

    get showTime(): ShowTime {
        return this._showTime;
    }
}
