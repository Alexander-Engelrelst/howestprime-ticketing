import type { UseCase } from '@/Application/Ports/mod.ts';
import type { OrderByBookingIdReadModel } from '@/Application/Ports/Queries/mod.ts';
import {
    type RouterContext,
    type WebApiController,
    WebApiResult,
} from '@/Infrastructure/WebApi/Shared/mod.ts';
import { IllegalArgumentException } from '@domaincrafters/std';
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
        const order = await this._getOrderByBookingIdUseCase.execute({bookingId} as GetOrderByBookingIdInput);

        WebApiResult.ok(ctx, order);
    }

    private extractBookingId(ctx: RouterContext<string>): string {
        const bookingId = ctx.params.bookingId;
        if (typeof bookingId !== 'string' || bookingId.trim().length === 0) {
            throw new IllegalArgumentException('Route parameter bookingId is required.');
        }

        // Validate UUID format (simple RFC4122 v4 pattern)
        const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
        if (!uuidRegex.test(bookingId)) {
            throw new IllegalArgumentException('Route parameter bookingId must be a valid UUID.');
        }

        return bookingId;
    }
}
