import type { AddCustomerToOrderUseCaseInput } from '@/Application/Ticketing/Orders/mod.ts';
import type { UseCase } from '@/Application/Ports/mod.ts';
import {
    RequestValidator,
    type RouterContext,
    type WebApiController,
    WebApiResult,
} from '@/Infrastructure/WebApi/Shared/mod.ts';
import { Guard, IllegalArgumentException } from '@domaincrafters/std';

interface AddCustomerRequest {
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
        
        const validator = RequestValidator.create([
            () => Guard.check(orderId, 'orderId')
            .isType('string')
            .againstWhitespace(),
        ]);

        validator
            .onValidationFailure("invalid add customer id")
            .validate();


        return orderId as string;
    }

    private mapToUseCaseInput(orderId: string, payload: unknown): AddCustomerToOrderUseCaseInput {
        const body = AddCustomerInformationController.validatePayload(payload);

        return {
            orderId,
            salutation: body.salutation,
            firstName: body.firstName,
            lastName: body.lastName,
            email: body.email,
            agreeToTerms: body.agreeToTerms,
        };
    }

    private static validatePayload(payload: unknown): AddCustomerRequest {
        if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
            throw new IllegalArgumentException('Request body must be a JSON object.');
        }

        const body = payload as AddCustomerRequest;

        const validator = RequestValidator.create([
            () => Guard.check(body.salutation, 'salutation').isType('string'),
            () => Guard.check(body.firstName, 'firstName').isType('string'),
            () => Guard.check(body.lastName, 'lastName').isType('string'),
            () => Guard.check(body.email, 'email').isType('string'),
            () => Guard.check(body.agreeToTerms, 'agreeToTerms').isType('boolean'),
        ]);

        validator
            .onValidationFailure("invalid add customer information request payload")
            .validate();

        return body;
    }
}
