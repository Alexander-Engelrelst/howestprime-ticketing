import { OrderForBookingNotFoundApplicationException } from '@/Application/Shared/mod.ts';
import { Logger, UseCase } from '@/Application/Ports/mod.ts';
import {
    GetOrderByBookingIdQueryPort,
    OrderByBookingIdReadModel,
} from '@/Application/Ports/Queries/mod.ts';

export type GetOrderByBookingIdInput = {
    bookingId: string;
};

export class GetOrderByBookingIdUseCase
    implements UseCase<GetOrderByBookingIdInput, OrderByBookingIdReadModel> {
    constructor(
        private readonly _query: GetOrderByBookingIdQueryPort,
        private readonly _logger: Logger,
    ) {}

    async execute(input: GetOrderByBookingIdInput): Promise<OrderByBookingIdReadModel> {
        this._logger.debug('Getting order by booking ID', { input });
        const orderOpt = await this._query.getOrderByBookingId(input.bookingId);

        // TODO(alexander): should this contain an explicity check if booking id is uuid format

        if (!orderOpt.isPresent) {
            throw new OrderForBookingNotFoundApplicationException(input.bookingId);
        }

        return orderOpt.value;
    }
}
