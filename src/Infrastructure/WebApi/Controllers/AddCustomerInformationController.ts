import type { AddCustomerToOrderUseCaseInput } from '@/Application/Ticketing/Orders/mod.ts';
import type { UseCase } from '@/Application/Ports/mod.ts';
import {
    type RouterContext,
    type WebApiController,
    WebApiResult,
} from '@/Infrastructure/WebApi/Shared/mod.ts';
import { Guard, IllegalArgumentException } from '@domaincrafters/std';

type AddCustomerRequest = {
    salutation: string;
    firstName: string;
    lastName: string;
    email: string;
    agreeToTerms: boolean;
};

export class AddCustomerInformationController implements WebApiController {
    constructor(
        private readonly _addCustomerInformationUseCase: UseCase<
            AddCustomerToOrderUseCaseInput,
            string
        >,
    ) {}

    async handle(ctx: RouterContext<string>): Promise<void> {
        const orderId = this.extractOrderId(ctx);
        const requestBody = await ctx.request.body.json();
        const input = this.mapToUseCaseInput(orderId, requestBody);
        await this._addCustomerInformationUseCase.execute(input);

        WebApiResult.created(ctx, `/api/orders/${orderId}`);
    }

    private extractOrderId(ctx: RouterContext<string>): string {
        const orderId = ctx.params.orderId;
        if (typeof orderId !== 'string' || orderId.trim().length === 0) {
            throw new IllegalArgumentException('Route parameter orderId is required.');
        }

        return orderId;
    }

    private mapToUseCaseInput(orderId: string, payload: unknown): AddCustomerToOrderUseCaseInput {
        if (payload === null || typeof payload !== 'object') {
            throw new IllegalArgumentException('Request body must be a JSON object.');
        }

        const body = payload as AddCustomerRequest;
        Guard.check(body.salutation, 'salutation').isType('string').againstEmpty();
        Guard.check(body.firstName, 'firstName').isType('string').againstEmpty();
        Guard.check(body.lastName, 'lastName').isType('string').againstEmpty();
        Guard.check(body.email, 'email').isType('string').againstEmpty();
        Guard.check(body.agreeToTerms, 'agreeToTerms').isType('boolean');

        return {
            orderId,
            salutation: body.salutation,
            firstName: body.firstName,
            lastName: body.lastName,
            email: body.email,
            agreeToTerms: body.agreeToTerms,
        };
    }
}
