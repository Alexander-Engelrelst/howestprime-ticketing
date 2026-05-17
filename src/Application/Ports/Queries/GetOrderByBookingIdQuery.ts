import type { Optional } from '@domaincrafters/std';

export type OrderByBookingIdReadModel = {
    id: string;
    bookingId: string;
    status: string;
    price: number;
    agreeToTerms: boolean;
    customer: Optional<OrderByBookingIdCustomerReadModel>;
    tickets: OrderByBookingIdTicketReadModel[];
};

export type OrderByBookingIdCustomerReadModel = {
    firstName: string;
    lastName: string;
    email: string;
    salutation: string;
};

export type OrderByBookingIdTicketReadModel = {
    ticketId: string;
    seatNumber: number;
    visitorType: string;
    price: number;
    movieId: string;
    room: string;
    showTime: Date;
};

export interface GetOrderByBookingIdQueryPort {
    getOrderByBookingId(bookingId: string): Promise<Optional<OrderByBookingIdReadModel>>;
}
