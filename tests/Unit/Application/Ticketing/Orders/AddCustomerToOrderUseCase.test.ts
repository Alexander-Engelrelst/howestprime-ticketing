import { assertEquals, assertRejects } from '@std/assert';
import { createMockUnitOfWork } from '@/tests/Unit/Application/Shared/mod.ts';
import type { Logger } from '@/Application/Ports/mod.ts';
import { AddCustomerToOrderUseCase } from '@/Application/Ticketing/Orders/mod.ts';
import { 
    Order, 
    OrderId, 
    BookingId, 
    TicketMappingService,
    VisitorType,
    MovieInfo,
    RoomName,
    ShowTime,
    CustomerMustAgreeToTermsException,
} from '@/Domain/Ticketing/Orders/mod.ts';
import { Money } from '@/Domain/Shared/mod.ts';
import { AgeRating, Genre, MovieDuration, MovieId, MovieTitle, PosterUrl } from '@/Domain/Ticketing/Movies/mod.ts';
import { OrderNotFoundApplicationException } from '@/Application/Shared/mod.ts';

const mockLogger: Logger = {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
};

/**
 * Helper to create a valid Order using the TicketMappingService
 * This ensures we always start with a valid aggregate state.
 */
const createTestOrder = (id: string): Order => {
    const movieId = MovieId.create('123e4567-e89b-12d3-a456-426614174000');

    const movieInfo = MovieInfo.create(
        movieId,
        MovieTitle.create('Inception'),
        MovieDuration.create(148),
        [Genre.create('Action')], // genres
        AgeRating.create(12),
        PosterUrl.create('https://example.com/poster.jpg'),
        Money.create(1500)
    );

    const tickets = TicketMappingService.mapToTickets(
        [10, 11], // seatNumbers
        [{ type: VisitorType.Standard, quantity: 2 }], // visitorTypes
        movieInfo,
        RoomName.create('Screen 1'),
        ShowTime.create(new Date())
    );

    return Order.create(
        OrderId.create(id),
        BookingId.create('f47ac10b-58cc-4372-a567-0e02b2c3d479'),
        tickets
    );
};

Deno.test(
    '[Unit] - AddCustomerToOrderUseCase - execute - valid input - updates and saves order',
    async () => {
        // Arrange
        const orderIdString = '550e8400-e29b-41d4-a716-446655440000';
        const testOrder = createTestOrder(orderIdString);
        
        const orderRepository = {
            byId: () => Promise.resolve({ isPresent: true, value: testOrder }),
            save: (_order: Order) => Promise.resolve(),
        };

        const unitOfWork = createMockUnitOfWork({
            repositories: new Map<string, any>([[Order.name, orderRepository]])
        });

        const useCase = new AddCustomerToOrderUseCase(unitOfWork, mockLogger);

        // Act
        const result = await useCase.execute({
            orderId: orderIdString,
            salutation: 'Mr.',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            agreeToTerms: true,
        });

        // Assert
        assertEquals(result, orderIdString);
        assertEquals(testOrder.agreeToTerms, true);
        assertEquals(testOrder.customer.isPresent, true);
        assertEquals(testOrder.customer.value.email.value, 'john.doe@example.com');
        
        assertEquals(unitOfWork.doCalled, true);
        assertEquals(unitOfWork.saveCalled, true);
    }
);

Deno.test(
    '[Unit] - AddCustomerToOrderUseCase - execute - failure scenarios',
    async (t) => {
        const orderIdString = '550e8400-e29b-41d4-a716-446655440000';

        await t.step('throws when order does not exist', async () => {
            const orderRepository = {
                byId: () => Promise.resolve({ isPresent: false, value: null }),
                save: (_order: Order) => Promise.resolve(),

            };
            const unitOfWork = createMockUnitOfWork({
                repositories: new Map<string, any>([[Order.name, orderRepository]])
            });
            const useCase = new AddCustomerToOrderUseCase(unitOfWork, mockLogger);

            await assertRejects(
                async () => await useCase.execute({
                    orderId: orderIdString,
                    salutation: 'Mr.',
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@example.com',
                    agreeToTerms: true,
                }),
                OrderNotFoundApplicationException
            );
        });

        await t.step('throws when customer does not agree to terms', async () => {
            const testOrder = createTestOrder(orderIdString);
            const orderRepository = {
                byId: (id: OrderId) => {
                    assertEquals(id.value, orderIdString);
                    return Promise.resolve({ isPresent: true, value: testOrder });
                },
                save: (_order: Order) => Promise.resolve(),
            };
            const unitOfWork = createMockUnitOfWork({
                repositories: new Map<string, any>([[Order.name, orderRepository]])
            });
            const useCase = new AddCustomerToOrderUseCase(unitOfWork, mockLogger);

            await assertRejects(
                async () => await useCase.execute({
                    orderId: orderIdString,
                    salutation: 'Mr.',
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@example.com',
                    agreeToTerms: false, // This will trigger CustomerMustAgreeToTermsException in the domain
                }),
                CustomerMustAgreeToTermsException
            );
            assertEquals(unitOfWork.saveCalled, false);
        });
    }
);