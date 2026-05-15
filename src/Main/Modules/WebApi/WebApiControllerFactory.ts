import { ServiceProvider } from '@domaincrafters/di';

import {
    CreateSuggestionUseCase,
    type CreateSuggestionUseCaseInput,
    GetSuggestionByIdQueryUseCase,
    type GetSuggestionByIdQueryUseCaseInput,
    ListSuggestionsQueryUseCase,
} from '@/Application/Ticketing/Suggestions/mod.ts';
import {
    AddCustomerToOrderUseCase,
    type AddCustomerToOrderUseCaseInput,
} from '@/Application/Ticketing/Orders/mod.ts';
import type { UseCase } from '@/Application/Ports/mod.ts';
import type {
    SuggestionByIdReadModel,
    SuggestionListItemReadModel,
} from '@/Application/Ports/Queries/mod.ts';
import {
    CreateSuggestionController,
    GetSuggestionByIdController,
    ListSuggestionsController,
    AddCustomerInformationController,
} from '@/Infrastructure/WebApi/Controllers/mod.ts';
import {
    type ControllerFactory,
    type RouterContext,
    type WebApiController,
} from '@/Infrastructure/WebApi/Shared/mod.ts';
import { IllegalStateException } from '@domaincrafters/std';

export class WebApiControllerFactory implements ControllerFactory {
    private readonly _serviceProvider: ServiceProvider;

    constructor(serviceProvider: ServiceProvider) {
        this._serviceProvider = serviceProvider;
    }

    async create(ctx: RouterContext<string>): Promise<WebApiController> {
        if (!ctx.routeName) {
            throw new IllegalStateException('Route name is not defined');
        }

        switch (ctx.routeName) {
            case CreateSuggestionController.name:
                return await this.createCreateSuggestionController();
            case ListSuggestionsController.name:
                return await this.createListSuggestionsController();
            case GetSuggestionByIdController.name:
                return await this.createGetSuggestionByIdController();
            case AddCustomerInformationController.name:
                return await this.createAddCustomerInformationController();

            default:
                throw new IllegalStateException(
                    `Controller for route ${ctx.routeName} is not defined`,
                );
        }
    }

    private async createCreateSuggestionController(): Promise<CreateSuggestionController> {
        const useCase = (await this._serviceProvider.getService<
            UseCase<CreateSuggestionUseCaseInput, string>
        >(CreateSuggestionUseCase.name)).getOrThrow();

        return new CreateSuggestionController(useCase);
    }

    private async createListSuggestionsController(): Promise<ListSuggestionsController> {
        const useCase = (await this._serviceProvider.getService<
            UseCase<void, SuggestionListItemReadModel[]>
        >(ListSuggestionsQueryUseCase.name)).getOrThrow();

        return new ListSuggestionsController(useCase);
    }

    private async createGetSuggestionByIdController(): Promise<GetSuggestionByIdController> {
        const useCase = (await this._serviceProvider.getService<
            UseCase<GetSuggestionByIdQueryUseCaseInput, SuggestionByIdReadModel>
        >(GetSuggestionByIdQueryUseCase.name)).getOrThrow();

        return new GetSuggestionByIdController(useCase);
    }

    private async createAddCustomerInformationController(): Promise<AddCustomerInformationController> {
        const useCase = (await this._serviceProvider.getService<
            UseCase<AddCustomerToOrderUseCaseInput, string>
        >(AddCustomerToOrderUseCase.name)).getOrThrow();

        return new AddCustomerInformationController(useCase);
    }
}
