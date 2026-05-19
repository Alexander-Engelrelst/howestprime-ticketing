import { ServiceCollection, ServiceProvider } from '@domaincrafters/di';

import {
    CreateSuggestionUseCase,
    type CreateSuggestionUseCaseInput,
    GetSuggestionByIdQueryUseCase,
    type GetSuggestionByIdQueryUseCaseInput,
    ListSuggestionsQueryUseCase,
    WhenSuggestionCreatedConsoleLogSuggestion,
} from '@/Application/Ticketing/Suggestions/mod.ts';
import { domainEventPolicies } from '@/Application/mod.ts';
import type { Logger, UseCase } from '@/Application/Ports/mod.ts';
import type {
    OrderByBookingIdReadModel,
    SuggestionByIdReadModel,
    SuggestionListItemReadModel,
} from '@/Application/Ports/Queries/mod.ts';
import { DomainEventRegistry } from '@/Infrastructure/Events/Shared/mod.ts';
import { PolicyDomainEventListener } from '@/Infrastructure/Events/mod.ts';
import {
    MongoDbGetOrderByBookingIdQuery,
    MongoDbGetSuggestionByIdQuery,
    MongoDbListSuggestionsQuery,
} from '@/Infrastructure/Persistence/MongoDb/Queries/mod.ts';
import { MongoDbUnitOfWork } from '@/Infrastructure/Persistence/MongoDb/Shared/mod.ts';
import { Config, ConsoleLogger } from '@/Infrastructure/Shared/mod.ts';
import { Module } from '@/Main/Modules/Shared/mod.ts';
import { OnlinePaymentService } from '@/Infrastructure/Payment/mod.ts';
import { SaveMovieUseCase, SaveMovieUseCaseInput } from '@/Application/Ticketing/Movies/mod.ts';
import {
    PayOrderUseCase,
    type PayOrderUseCaseInput,
} from '@/Application/Ticketing/Payments/mod.ts';
import type { PaymentService } from '@/Application/Ports/Gateways/PaymentService.ts';
import {
    AddCustomerToOrderUseCase,
    AddCustomerToOrderUseCaseInput,
    CreateOrderFromBookingUseCase,
    CreateOrderFromBookingUseCaseInput,
    MarkOrderAsPaidUseCase,
    type MarkOrderAsPaidUseCaseInput,
    GetOrderByBookingIdInput,
    GetOrderByBookingIdUseCase,
    ReleaseTicketUseCaseInput,
} from '@/Application/Ticketing/Orders/mod.ts';
import { WhenPaymentSucceededThenMarkOrderAsPaid } from '@/Application/Ticketing/Orders/WhenPaymentSucceededThenMarkOrderAsPaid.ts';
import { ReleaseTicketUseCase } from '@/Application/Ticketing/Orders/ReleaseTicketUseCase.ts';
import { WhenOrderPaidThenReleaseTickets } from '@/Application/Ticketing/Orders/WhenOrderPaidThenReleaseTickets.ts';

export class Application implements Module {
    add(serviceCollection: ServiceCollection, _config: Config): void {
        console.log('Application module added');
        this.addUseCases(serviceCollection);
        this.addPolicies(serviceCollection);

        serviceCollection.addScoped(
            OnlinePaymentService.name,
            () => Promise.resolve(new OnlinePaymentService()),
        );
    }

    private addUseCases(serviceCollection: ServiceCollection): void {
        serviceCollection.addScoped(
            CreateSuggestionUseCase.name,
            async (serviceProvider: ServiceProvider) => {
                const unitOfWork = (await serviceProvider.getService<MongoDbUnitOfWork>(
                    MongoDbUnitOfWork.name,
                )).getOrThrow();

                const logger = (await serviceProvider.getService<Logger>(ConsoleLogger.name))
                    .getOrThrow();

                const useCase: UseCase<CreateSuggestionUseCaseInput, string> =
                    new CreateSuggestionUseCase(
                        unitOfWork,
                        logger,
                    );

                return useCase;
            },
        );

        serviceCollection.addScoped(
            ListSuggestionsQueryUseCase.name,
            async (serviceProvider: ServiceProvider) => {
                const query = (await serviceProvider.getService<MongoDbListSuggestionsQuery>(
                    MongoDbListSuggestionsQuery.name,
                )).getOrThrow();

                const logger = (await serviceProvider.getService<Logger>(ConsoleLogger.name))
                    .getOrThrow();

                const useCase: UseCase<void, SuggestionListItemReadModel[]> =
                    new ListSuggestionsQueryUseCase(
                        query,
                        logger,
                    );

                return useCase;
            },
        );

        serviceCollection.addScoped(
            GetSuggestionByIdQueryUseCase.name,
            async (serviceProvider: ServiceProvider) => {
                const query = (await serviceProvider.getService<MongoDbGetSuggestionByIdQuery>(
                    MongoDbGetSuggestionByIdQuery.name,
                )).getOrThrow();

                const logger = (await serviceProvider.getService<Logger>(ConsoleLogger.name))
                    .getOrThrow();

                const useCase: UseCase<
                    GetSuggestionByIdQueryUseCaseInput,
                    SuggestionByIdReadModel
                > = new GetSuggestionByIdQueryUseCase(
                    query,
                    logger,
                );

                return useCase;
            },
        );

        serviceCollection.addScoped(
            SaveMovieUseCase.name,
            async (serviceProvider: ServiceProvider) => {
                const unitOfWork = (await serviceProvider.getService<MongoDbUnitOfWork>(
                    MongoDbUnitOfWork.name,
                )).getOrThrow();

                const logger = (await serviceProvider.getService<Logger>(ConsoleLogger.name))
                    .getOrThrow();

                const useCase: UseCase<SaveMovieUseCaseInput, void> = new SaveMovieUseCase(
                    unitOfWork,
                    logger,
                );

                return useCase;
            },
        );

        serviceCollection.addScoped(
            CreateOrderFromBookingUseCase.name,
            async (serviceProvider: ServiceProvider) => {
                const unitOfWork = (await serviceProvider.getService<MongoDbUnitOfWork>(
                    MongoDbUnitOfWork.name,
                )).getOrThrow();

                const logger = (await serviceProvider.getService<Logger>(ConsoleLogger.name))
                    .getOrThrow();

                const useCase: UseCase<CreateOrderFromBookingUseCaseInput, void> =
                    new CreateOrderFromBookingUseCase(
                        unitOfWork,
                        logger,
                    );

                return useCase;
            },
        );

        serviceCollection.addScoped(
            AddCustomerToOrderUseCase.name,
            async (serviceProvider: ServiceProvider) => {
                const unitOfWork = (await serviceProvider.getService<MongoDbUnitOfWork>(
                    MongoDbUnitOfWork.name,
                )).getOrThrow();

                const logger = (await serviceProvider.getService<Logger>(ConsoleLogger.name))
                    .getOrThrow();

                const useCase: UseCase<AddCustomerToOrderUseCaseInput, string> =
                    new AddCustomerToOrderUseCase(
                        unitOfWork,
                        logger,
                    );

                return useCase;
            },
        );

        serviceCollection.addScoped(
            GetOrderByBookingIdUseCase.name,
            async (serviceProvider: ServiceProvider) => {
                const query = (await serviceProvider.getService<MongoDbGetOrderByBookingIdQuery>(
                    MongoDbGetOrderByBookingIdQuery.name,
                )).getOrThrow();

                const logger = (await serviceProvider.getService<Logger>(ConsoleLogger.name))
                    .getOrThrow();

                const useCase: UseCase<
                    GetOrderByBookingIdInput,
                    OrderByBookingIdReadModel
                > = new GetOrderByBookingIdUseCase(
                    query,
                    logger,
                );

                return useCase;
            },
        );

        serviceCollection.addScoped(
            PayOrderUseCase.name,
            async (serviceProvider: ServiceProvider) => {
                const unitOfWork = (await serviceProvider.getService<MongoDbUnitOfWork>(
                    MongoDbUnitOfWork.name,
                )).getOrThrow();

                const logger = (await serviceProvider.getService<Logger>(ConsoleLogger.name))
                    .getOrThrow();

                const paymentService = (await serviceProvider.getService<PaymentService>(
                    OnlinePaymentService.name,
                )).getOrThrow();

                const useCase: UseCase<PayOrderUseCaseInput, string> = new PayOrderUseCase(
                    unitOfWork,
                    logger,
                    paymentService,
                );

                return useCase;
            },
        );

        serviceCollection.addScoped(
            MarkOrderAsPaidUseCase.name,
            async (serviceProvider: ServiceProvider) => {
                const unitOfWork = (await serviceProvider.getService<MongoDbUnitOfWork>(
                    MongoDbUnitOfWork.name,
                )).getOrThrow();

                const logger = (await serviceProvider.getService<Logger>(ConsoleLogger.name))
                    .getOrThrow();

                const useCase: UseCase<MarkOrderAsPaidUseCaseInput, void> =
                    new MarkOrderAsPaidUseCase(
                        unitOfWork,
                        logger,
                    );

                return useCase;
            },
        );

        serviceCollection.addScoped(
            ReleaseTicketUseCase.name,
            async (serviceProvider: ServiceProvider) => {
                const unitOfWork = (await serviceProvider.getService<MongoDbUnitOfWork>(
                    MongoDbUnitOfWork.name,
                )).getOrThrow();

                const logger = (await serviceProvider.getService<Logger>(ConsoleLogger.name))
                    .getOrThrow();

                const useCase: UseCase<unknown, void> = new ReleaseTicketUseCase(
                    unitOfWork,
                    logger,
                );

                return useCase;
            },
        );
    }

    private addPolicies(serviceCollection: ServiceCollection): void {
        serviceCollection.addScoped(
            WhenSuggestionCreatedConsoleLogSuggestion.name,
            async (serviceProvider: ServiceProvider) => {
                const logger = (await serviceProvider.getService<Logger>(
                    ConsoleLogger.name,
                )).getOrThrow();

                return new WhenSuggestionCreatedConsoleLogSuggestion(logger);
            },
        );

        serviceCollection.addScoped(
            WhenPaymentSucceededThenMarkOrderAsPaid.name,
            async (serviceProvider: ServiceProvider) => {
                const logger = (await serviceProvider.getService<Logger>(
                    ConsoleLogger.name,
                )).getOrThrow();

                const markOrderAsPaid = (await serviceProvider.getService<UseCase<
                    MarkOrderAsPaidUseCaseInput,
                    void
                >>(MarkOrderAsPaidUseCase.name)).getOrThrow();

                return new WhenPaymentSucceededThenMarkOrderAsPaid(
                    logger,
                    markOrderAsPaid,
                );
            },
        );

        serviceCollection.addScoped(
            WhenOrderPaidThenReleaseTickets.name,
            async (serviceProvider: ServiceProvider) => {
                const logger = (await serviceProvider.getService<Logger>(
                    ConsoleLogger.name,
                )).getOrThrow();

                const releaseTicket = (await serviceProvider.getService<UseCase<
                    ReleaseTicketUseCaseInput,
                    void
                >>(ReleaseTicketUseCase.name)).getOrThrow();

                return new WhenOrderPaidThenReleaseTickets(
                    logger,
                    releaseTicket,
                );
            },
        );
    }

    async use(serviceProvider: ServiceProvider): Promise<void> {
        console.log('Application module use - Wiring policyregistry');

        // Get event bus from DI container
        const eventListener = (await serviceProvider.getService<PolicyDomainEventListener>(
            'PolicyDomainEventListener',
        ))
            .getOrThrow();

        // Create policy registry (Infrastructure)
        const policyregistry = new DomainEventRegistry([eventListener]);

        console.log(
            'Application module use - Registering policies from Application layer mapping',
            domainEventPolicies,
        );

        // Register policies from Application layer mapping
        // Policy instances are NOT resolved here - the EventBus will resolve them
        // with a fresh scope when handling each event
        policyregistry.registerFromMapping(domainEventPolicies);

        // Subscribe all policyregistry to event bus
        await policyregistry.subscribeAll();
    }

    static create(): Module {
        return new Application();
    }
}
