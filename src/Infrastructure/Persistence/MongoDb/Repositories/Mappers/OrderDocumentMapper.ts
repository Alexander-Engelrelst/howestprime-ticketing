import {
    DocumentMapper,
    serializeObjectToDocument,
} from '@/Infrastructure/Persistence/MongoDb/Shared/mod.ts';
import { Document } from '@mongodb';
import {
    BookingId,
    Customer,
    CustomerEmail,
    CustomerFirstName,
    CustomerLastName,
    CustomerSalutation,
    MovieInfo,
    Order,
    OrderId,
    OrderStatus,
    RoomName,
    Seat,
    ShowTime,
    Ticket,
    TicketId,
    VisitorType,
} from '@/Domain/Ticketing/Orders/mod.ts';
import { Money } from '@/Domain/Shared/mod.ts';
import { Optional } from '@domaincrafters/std';
import {
    AgeRating,
    Genre,
    MovieDuration,
    MovieId,
    MovieTitle,
    PosterUrl,
} from '@/Domain/Ticketing/Movies/mod.ts';

type movieInfoDocument = {
    movieId: string;
    title: string;
    duration: number;
    genres: string[];
    ageRating: number;
    posterUrl: string;
    price: number;
};

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
};

type customerDocument = {
    firstName: string;
    lastName: string;
    email: string;
    salutation: string;
};

export class OrderDocumentMapper implements DocumentMapper<Order> {
    toDocument(order: Order): Document {
        const document = serializeObjectToDocument({
            _id: order.id.toString(),
            bookingId: order.bookingId.value,
            agreeToTerms: order.agreeToTerms,
            price: order.price.value,
            status: order.status,
            tickets: order.tickets.map((ticket) => this.TicketToDocument(ticket)),
            customer: order.customer.isPresent
                ? {
                    firstName: order.customer.value.firstName,
                    lastName: order.customer.value.lastName,
                    email: order.customer.value.email,
                    salutation: order.customer.value.salutation,
                }
                : undefined,
        });
        return document;
    }

    reconstitute(document: Document): Order {
        const orderData = document as unknown as {
            _id: string;
            bookingId: string;
            price: number;
            status: OrderStatus;
            agreeToTerms: boolean;
            tickets: ticketDocument[];
            customer?: customerDocument;
        };

        const ticketsData = Array.isArray(orderData.tickets) ? orderData.tickets : [];
        const tickets = ticketsData.map((ticket) => this.reconstituteTicket(ticket));

        const order = Object.create(Order.prototype);
        order['_id'] = OrderId.create(document.id ?? document._id);
        order['_bookingId'] = BookingId.create(orderData.bookingId);
        order['_price'] = Money.create(orderData.price);
        order['_status'] = orderData.status;
        order['_agreeToTerms'] = orderData.agreeToTerms;
        order['_tickets'] = tickets;
        order['_domainEvents'] = [];

        if (orderData.customer) {
            order['_customer'] = Optional.of(this.reconstituteCustomer(orderData.customer));
        } else {
            order['_customer'] = Optional.empty<Customer>();
        }

        return order as Order;
    }

    private reconstituteCustomer(data: unknown): Customer {
        const customerData = data as customerDocument;
        const customer = Object.create(Customer.prototype);
        customer['_firstName'] = CustomerFirstName.create(customerData.firstName);
        customer['_lastName'] = CustomerLastName.create(customerData.lastName);
        customer['_email'] = CustomerEmail.create(customerData.email);
        customer['_salutation'] = CustomerSalutation.create(customerData.salutation);
        return customer;
    }

    private reconstituteTicket(doc: ticketDocument): Ticket {
        const ticket = Object.create(Ticket.prototype);

        const seat = Object.create(Seat.prototype);
        seat['_seatNumber'] = doc.seat.seatNumber;
        seat['_visitorType'] = doc.seat.visitorType as VisitorType;

        const mDoc = doc.movieInfo;
        const movieInfo = Object.create(MovieInfo.prototype);
        movieInfo['_movieId'] = MovieId.create(mDoc.movieId);
        movieInfo['_title'] = MovieTitle.create(mDoc.title);
        movieInfo['_duration'] = MovieDuration.create(mDoc.duration);
        movieInfo['_genres'] = mDoc.genres.map((g: string) => Genre.create(g));
        movieInfo['_ageRating'] = AgeRating.create(mDoc.ageRating);
        movieInfo['_posterUrl'] = PosterUrl.create(mDoc.posterUrl);
        movieInfo['_price'] = Money.create(mDoc.price);

        ticket['_id'] = TicketId.create(doc.id);
        ticket['_seat'] = seat;
        ticket['_price'] = Money.create(doc.price);
        ticket['_showTime'] = ShowTime.create(doc.showTime);
        ticket['_room'] = RoomName.create(doc.room);
        ticket['_movieInfo'] = movieInfo;

        return ticket as Ticket;
    }

    private TicketToDocument(ticket: Ticket): ticketDocument {
        return {
            id: ticket.id.toString(),
            seat: {
                visitorType: ticket.seat.visitorType,
                seatNumber: ticket.seat.seatNumber,
            },
            price: ticket.price.value,
            showTime: ticket.showTime.value,
            room: ticket.room.value,
            movieInfo: {
                movieId: ticket.movieInfo.movieId.value,
                title: ticket.movieInfo.title.value,
                duration: ticket.movieInfo.duration.value,
                genres: ticket.movieInfo.genres.map((genre) => genre.value),
                ageRating: ticket.movieInfo.ageRating.value,
                posterUrl: ticket.movieInfo.posterUrl.value,
                price: ticket.movieInfo.price.value,
            },
        };
    }
}
