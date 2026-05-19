import type { UseCase } from '@/Application/Ports/mod.ts';
import type { OrderByBookingIdReadModel } from '@/Application/Ports/Queries/mod.ts';
import {
    RequestValidator,
    type RouterContext,
    type WebApiController,
    WebApiResult,
} from '@/Infrastructure/WebApi/Shared/mod.ts';
import { Guard } from '@domaincrafters/std';
import { GetOrderByBookingIdInput } from '@/Application/Ticketing/Orders/GetOrderByBookingIdUseCase.ts';

export class GetOrderByBookingIdController implements WebApiController {
    constructor(
        private readonly _getOrderByBookingIdUseCase: UseCase<
            GetOrderByBookingIdInput,
            OrderByBookingIdReadModel
        >,
    ) {}

    async handle(ctx: RouterContext<string>): Promise<void> {
        const bookingId = this.extractBookingId(ctx);
        const order = await this._getOrderByBookingIdUseCase.execute(
            { bookingId } as GetOrderByBookingIdInput,
        );

        WebApiResult.ok(ctx, this.mapToDto(order));
    }

    private extractBookingId(ctx: RouterContext<string>): string {
        const bookingId = ctx.params.bookingId;

        const validator = RequestValidator.create([
            () =>
                Guard.check(bookingId, 'bookingId')
                    .isType('string')
                    .againstWhitespace(),
        ]);

        // TODO(alexander): does this require a check for a valid UUID format?

        validator
            .onValidationFailure('invalid booking id')
            .validate();

        return bookingId as string;
    }

    private mapToDto(order: OrderByBookingIdReadModel): OrderByBookingIdDto {
        return {
            id: order.id,
            bookingId: order.bookingId,
            status: order.status,
            price: order.price,
            agreeToTerms: order.agreeToTerms,
            tickets: order.tickets.map((t) => ({
                ticketId: t.ticketId,
                seatNumber: String(t.seatNumber),
                visitorType: t.visitorType,
                price: t.price,
                movieId: t.movieId,
                room: t.room,
                showTime: t.showTime,
            })),
            customer: order.customer.isPresent ? {
                firstName: order.customer.value.firstName,
                lastName: order.customer.value.lastName,
                email: order.customer.value.email,
                salutation: order.customer.value.salutation,
            } : null,
        };
    }
}


interface OrderByBookingIdDto {
    id: string;
    bookingId: string;
    status: string;
    price: number;
    agreeToTerms: boolean;
    customer: OrderByBookingIdCustomerDto | null;
    tickets: OrderByBookingIdTicketDto[];
};

interface OrderByBookingIdCustomerDto {
    firstName: string;
    lastName: string;
    email: string;
    salutation: string;
};

interface OrderByBookingIdTicketDto {
    ticketId: string;
    seatNumber: string;
    visitorType: string;
    price: number;
    movieId: string;
    room: string;
    showTime: Date;
};
