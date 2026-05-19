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

        WebApiResult.ok(ctx, order);
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
}
