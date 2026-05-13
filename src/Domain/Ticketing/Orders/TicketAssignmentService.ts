import { MovieInfo, RoomName, Seat, ShowTime, Ticket, TicketId, VisitorType } from '@/Domain/Ticketing/Orders/mod.ts';

export type VisitorTypeQuantity = {
    type: VisitorType;
    quantity: number;
};

export abstract class TicketMappingService {
    static mapToTickets(
        seatNumbers: number[],
        visitorTypes: VisitorTypeQuantity[],
        movieInfo: MovieInfo,
        room: RoomName,
        showTime: ShowTime
    ): Ticket[] {
        if (seatNumbers.length !== visitorTypes.reduce((sum, vt) => sum + vt.quantity, 0)) {
            // TODO(alexander) custom exception
            throw new Error("The total quantity of visitor types must match the number of seat numbers provided.");
        }

        const tickets: Ticket[] = [];
        let seatIndex = 0;

        for (const visitorTypeQuantity of visitorTypes) {
            for (let i = 0; i < visitorTypeQuantity.quantity; i++) {
                const seatNumber = seatNumbers[seatIndex]!;
                const seat = Seat.create(seatNumber, visitorTypeQuantity.type);
                const ticketId = TicketId.create();
                const ticket = Ticket.create(ticketId, movieInfo, seat, room, showTime);
                tickets.push(ticket);
                seatIndex++;
            }

        }

        return tickets;
    }
}