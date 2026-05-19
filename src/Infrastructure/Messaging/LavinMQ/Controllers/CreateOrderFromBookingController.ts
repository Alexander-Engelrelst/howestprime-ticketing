import { AmqpController } from '@/Infrastructure/Messaging/LavinMQ/Shared/mod.ts';
import { CreateOrderFromBookingUseCaseInput } from '@/Application/Ticketing/Orders/mod.ts';
import { UseCase } from '@/Application/Ports/mod.ts';
import { Guard, IllegalArgumentException } from '@domaincrafters/std';

export interface CreateOrderFromBookingRequest {
    bookingId: string;
    movieId: string;
    room: string;
    showtime: string;
    standardVisitors: number;
    discountedVisitors: number;
    seatNumbers: number[];
}

export class CreateOrderFromBookingController
    implements AmqpController<CreateOrderFromBookingRequest> {
    constructor(
        private readonly _createOrderFromBookingUseCase: UseCase<
            CreateOrderFromBookingUseCaseInput,
            void
        >,
    ) {}

    async handle(request: CreateOrderFromBookingRequest): Promise<void> {
        const input = this.extractInput(request as unknown);
        await this._createOrderFromBookingUseCase.execute(input);
    }

    private extractInput(request: unknown): CreateOrderFromBookingUseCaseInput {
        const payload = CreateOrderFromBookingController.validatePayload(request);
        const showTimeDate = new Date(payload.showtime);

        return {
            bookingId: payload.bookingId,
            movieId: payload.movieId,
            room: payload.room,
            showTime: showTimeDate,
            numberOfStandardTickets: payload.standardVisitors,
            numberOfDiscountedTickets: payload.discountedVisitors,
            seatNumbers: payload.seatNumbers,
        };
    }

    private static validatePayload(request: unknown): CreateOrderFromBookingRequest {
        Guard.check(request, 'request').againstNullOrUndefined();

        if (typeof request !== 'object' || Array.isArray(request)) {
            throw new IllegalArgumentException('Booking opened payload must be a JSON object.');
        }

        const payload = request as Record<string, unknown>;
        if (Object.hasOwn(payload, 'payload')) {
            throw new IllegalArgumentException(
                "Unexpected wrapper field 'payload'. Expected direct fields: bookingId, movieId, room, showtime, standardVisitors, discountedVisitors, seatNumbers.",
            );
        }

        Guard.check(payload.bookingId, 'bookingId').isType('string').againstEmpty();
        Guard.check(payload.movieId, 'movieId').isType('string').againstEmpty();
        Guard.check(payload.room, 'room').isType('string').againstEmpty();
        Guard.check(payload.showtime, 'showtime').isType('string').againstEmpty();
        Guard.check(payload.standardVisitors, 'standardVisitors').isType('number');
        Guard.check(payload.discountedVisitors, 'discountedVisitors').isType('number');
        Guard.check(payload.seatNumbers, 'seatNumbers').againstNullOrUndefined();

        if (!Array.isArray(payload.seatNumbers)) {
            throw new IllegalArgumentException('seatNumbers must be an array.');
        }

        const seatNumbers = payload.seatNumbers as unknown[];
        seatNumbers.forEach((seatNumber: unknown) => {
            Guard.check(seatNumber, 'seatNumber').isType('number');
        });

        const showTimeDate = new Date(payload.showtime as string);
        if (isNaN(showTimeDate.getTime())) {
            throw new IllegalArgumentException('showtime must be a valid date string.');
        }

        return {
            bookingId: payload.bookingId as string,
            movieId: payload.movieId as string,
            room: payload.room as string,
            showtime: payload.showtime as string,
            standardVisitors: payload.standardVisitors as number,
            discountedVisitors: payload.discountedVisitors as number,
            seatNumbers: seatNumbers as number[],
        };
    }
}
