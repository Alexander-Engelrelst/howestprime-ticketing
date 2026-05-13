import { DocumentMapper, serializeObjectToDocument } from '@/Infrastructure/Persistence/MongoDb/Shared/mod.ts';
import { Document } from '@mongodb';
import { Order, OrderId, Ticket } from '@/Domain/Ticketing/Orders/mod.ts';

type movieInfoDocument = {
    movieId: string;
    title: string;
    duration: number;
    genres: string[];
    ageRating: number;
    posterUrl: string;
    price: number;
}

type ticketDocument = {
    id: string;
    seat: {
        visitorType: string;
        seatNumber: number;
    };
    price: number;
    showTime: Date;
    room: string;
    movieInfo: movieInfoDocument;
}

export class OrderDocumentMapper implements DocumentMapper<Order> {
    toDocument(order: Order): Document {
        
        const document = serializeObjectToDocument({
            _id: order.id.toString(),
            bookingId: order.bookingId.value,
            agreeToTerms: order.agreeToTerms,
            price: order.price.value,
            status: order.status,
            tickets: order.tickets.map(this.TicketToDocument),
            customer: order.customer.isPresent ? {
                firstName: order.customer.value.firstName,
                lastName: order.customer.value.lastName,
                email: order.customer.value.email,
                salutation: order.customer.value.salutation,
            } : undefined
        });
        return document;
    }

    reconstitute(document: Document): Order {
        const order = Object.create(Order.prototype);
        order['_id'] = OrderId.create(document._id);
        // TODO(alexander) : add other properties
        return order as Order;
    }
    
    private TicketToDocument(ticket: Ticket): ticketDocument {
        return {
            id: ticket.id.toString(),
                seat: {
                    visitorType: ticket.seat.visitorType,
                    seatNumber: ticket.seat.seatNumber
                },
                price: ticket.price.value,
                showTime: ticket.showTime.value,
                room: ticket.room.value,
                movieInfo: {
                    movieId: ticket.movieInfo.movieId.value,
                    title: ticket.movieInfo.title.value,
                    duration: ticket.movieInfo.duration.value,
                    genres: ticket.movieInfo.genres.map(genre => genre.value),
                    ageRating: ticket.movieInfo.ageRating.value,
                    posterUrl: ticket.movieInfo.posterUrl.value,
                    price: ticket.movieInfo.price.value,
                }
        };
    }
}