import { ServiceCollection, ServiceProvider } from '@domaincrafters/di';

import { Config } from '@/Infrastructure/Shared/mod.ts';
import { Module } from '@/Main/Modules/Shared/mod.ts';
import {
    InMemoryContext,
    InMemoryUnitOfWork,
} from '@/Infrastructure/Persistence/InMemory/Shared/mod.ts';

import { PublishDomainEventsInMemoryUnitOfWorkInterceptor } from '@/Infrastructure/Persistence/InMemory/Interceptors/InMemoryUnitOfWorkInterceptors.ts';
import { AggregateRoot, EntityId, Repository } from '@/Domain/Shared/mod.ts';
import { InMemoryDomainEventPublisher } from '@/Infrastructure/Events/mod.ts';
import {
    PublishDomainEventsMongoDbUnitOfWorkInterceptor,
} from '@/Infrastructure/Persistence/MongoDb/mod.ts';
import {
    MongoDbMovieRepository,
    MongoDbOrderRepository,
    MongoDbSuggestionRepository,
    MovieDocumentMapper,
    OrderDocumentMapper,
    SuggestionDocumentMapper,
} from '@/Infrastructure/Persistence/MongoDb/Repositories/mod.ts';
import {
    MongoDbGetOrderByBookingIdQuery,
    MongoDbGetSuggestionByIdQuery,
    MongoDbListSuggestionsQuery,
} from '@/Infrastructure/Persistence/MongoDb/Queries/mod.ts';
import {
    MongoDbClient,
    MongoDbServices,
    MongoDbUnitOfWork,
} from '@/Infrastructure/Persistence/MongoDb/Shared/mod.ts';

export class Persistence implements Module {
    add(serviceCollection: ServiceCollection, config: Config): void {
        console.log('Persistence module added', serviceCollection, config);

        MongoDbServices.add(config, serviceCollection, [
            MongoDbSuggestionRepository.name,
            MongoDbMovieRepository.name,
        ]);

        // Register InMemoryContext as singleton
        serviceCollection.addSingleton(
            'InMemoryContext',
            () => Promise.resolve(new InMemoryContext()),
        );

        this.registerRepositories(serviceCollection);
        this.registerQueries(serviceCollection);

        serviceCollection.addScoped(
            InMemoryUnitOfWork.name,
            async (serviceProvider: ServiceProvider) => {
                const eventPublisher =
                    (await serviceProvider.getService<InMemoryDomainEventPublisher>(
                        'InMemoryDomainEventPublisher',
                    )).getOrThrow();

                /*
                const repository = (await serviceProvider.getService<InMemoryTournamentRepository>(
                    InMemoryTournamentRepository.name,
                )).getOrThrow();
                const tournamentRunRepository =
                    (await serviceProvider.getService<InMemoryTournamentRunRepository>(
                        InMemoryTournamentRunRepository.name,
                    )).getOrThrow();

                    */
                const repositories = new Map<string, Repository<AggregateRoot<EntityId>, EntityId>>(
                    [
                        //[Tournament.name, repository],
                        //[TournamentRun.name, tournamentRunRepository],
                    ],
                );

                const unitOfWork = new InMemoryUnitOfWork(repositories);

                const interceptors = [
                    new PublishDomainEventsInMemoryUnitOfWorkInterceptor(
                        unitOfWork,
                        eventPublisher,
                    ),
                ];

                // Set interceptors after construction (needed because interceptor needs reference to unitOfWork)
                unitOfWork.setInterceptors(interceptors);

                return unitOfWork;
            },
        );
        serviceCollection.addScoped(
            MongoDbUnitOfWork.name,
            async (serviceProvider: ServiceProvider) => {
                const mongoClient =
                    (await serviceProvider.getService<MongoDbClient>('MongoDbClient')).getOrThrow();
                const eventPublisher =
                    (await serviceProvider.getService<InMemoryDomainEventPublisher>(
                        'InMemoryDomainEventPublisher',
                    )).getOrThrow();
                const suggestionRepository = (await serviceProvider.getService<
                    MongoDbSuggestionRepository
                >(
                    MongoDbSuggestionRepository.name,
                )).getOrThrow();

                const unitOfWork = new MongoDbUnitOfWork(mongoClient.session);
                unitOfWork.registerRepository(suggestionRepository);

                const movieRepository = (await serviceProvider.getService<
                    MongoDbMovieRepository
                >(
                    MongoDbMovieRepository.name,
                )).getOrThrow();
                unitOfWork.registerRepository(movieRepository);

                const orderRepository = (await serviceProvider.getService<
                    MongoDbOrderRepository
                >(
                    MongoDbOrderRepository.name,
                )).getOrThrow();
                unitOfWork.registerRepository(orderRepository);

                const interceptors = [
                    new PublishDomainEventsMongoDbUnitOfWorkInterceptor(
                        unitOfWork,
                        eventPublisher,
                    ),
                ];

                unitOfWork.setInterceptors(interceptors);

                return unitOfWork;
            },
        );
    }

    private registerRepositories(serviceCollection: ServiceCollection): void {
        serviceCollection.addScoped(
            MongoDbSuggestionRepository.name,
            async (serviceProvider: ServiceProvider) => {
                const mongoClient =
                    (await serviceProvider.getService<MongoDbClient>('MongoDbClient')).getOrThrow();
                const mapper = new SuggestionDocumentMapper();

                return new MongoDbSuggestionRepository(mongoClient, mapper);
            },
        );

        serviceCollection.addScoped(
            MongoDbMovieRepository.name,
            async (serviceProvider: ServiceProvider) => {
                const mongoClient =
                    (await serviceProvider.getService<MongoDbClient>('MongoDbClient')).getOrThrow();
                const mapper = new MovieDocumentMapper();

                return new MongoDbMovieRepository(mongoClient, mapper);
            },
        );
        serviceCollection.addScoped(
            MongoDbOrderRepository.name,
            async (serviceProvider: ServiceProvider) => {
                const mongoClient =
                    (await serviceProvider.getService<MongoDbClient>('MongoDbClient')).getOrThrow();

                const mapper = new OrderDocumentMapper();
                return new MongoDbOrderRepository(mongoClient, mapper);
            },
        );
        /*
        serviceCollection.addScoped(
            InMemoryTournamentRepository.name,
            async (serviceProvider: ServiceProvider) => {
                const context = (await serviceProvider.getService<InMemoryContext>(
                    InMemoryContext.name,
                )).getOrThrow();

                return new InMemoryTournamentRepository(context);
            },
        );
        */
    }

    private registerQueries(serviceCollection: ServiceCollection): void {
        serviceCollection.addScoped(
            MongoDbListSuggestionsQuery.name,
            async (serviceProvider: ServiceProvider) => {
                const mongoClient =
                    (await serviceProvider.getService<MongoDbClient>('MongoDbClient')).getOrThrow();

                return new MongoDbListSuggestionsQuery(mongoClient);
            },
        );

        serviceCollection.addScoped(
            MongoDbGetSuggestionByIdQuery.name,
            async (serviceProvider: ServiceProvider) => {
                const mongoClient =
                    (await serviceProvider.getService<MongoDbClient>('MongoDbClient')).getOrThrow();

                return new MongoDbGetSuggestionByIdQuery(mongoClient);
            },
        );

        serviceCollection.addScoped(
            MongoDbGetOrderByBookingIdQuery.name,
            async (serviceProvider: ServiceProvider) => {
                const mongoClient =
                    (await serviceProvider.getService<MongoDbClient>('MongoDbClient')).getOrThrow();

                return new MongoDbGetOrderByBookingIdQuery(mongoClient);
            },
        );

        /*
        serviceCollection.addScoped(
            InMemoryFindAllTournamentsQuery.name,
            async (serviceProvider: ServiceProvider) => {
                const context = (await serviceProvider.getService<InMemoryContext>(
                    InMemoryContext.name,
                )).getOrThrow();

                return new InMemoryFindAllTournamentsQuery(context);
            },
        );
        */
    }

    use(_serviceProvider: ServiceProvider): Promise<void> {
        console.log('Persistence module used');
        return Promise.resolve();
    }

    static create(): Module {
        return new Persistence();
    }
}
