import { assertEquals, assertRejects } from '@std/assert';
import { Optional } from '@domaincrafters/std';
import { 
    GetOrderByBookingIdUseCase, 
    GetOrderByBookingIdInput 
} from '@/Application/Ticketing/Orders/GetOrderByBookingIdUseCase.ts'; // Adjust path as needed
import { OrderForBookingNotFoundApplicationException } from '@/Application/Shared/mod.ts';
import type { Logger } from '@/Application/Ports/mod.ts';
import type { 
    GetOrderByBookingIdQueryPort, 
    OrderByBookingIdCustomerReadModel, 
    OrderByBookingIdReadModel 
} from '@/Application/Ports/Queries/mod.ts';

// Mock logger following your template pattern
const mockLogger: Logger = {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
};

/**
 * Helper to build a completely type-safe mock read model matching your interfaces
 */
const createMockReadModel = (bookingId: string): OrderByBookingIdReadModel => {
    return {
        id: '550e8400-e29b-41d4-a716-446655440000',
        bookingId: bookingId,
        status: 'Confirmed',
        price: 30.00,
        agreeToTerms: true,
        customer: Optional.of<OrderByBookingIdCustomerReadModel>({
            salutation: 'Mr.',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
        }),
        tickets: [
            {
                ticketId: 't1-uuid-string',
                seatNumber: 10,
                visitorType: 'Standard',
                price: 15.00,
                movieId: 'movie-uuid-123',
                room: 'Screen 1',
                showTime: new Date('2026-05-20T20:00:00Z'),
            },
            {
                ticketId: 't2-uuid-string',
                seatNumber: 11,
                visitorType: 'Standard',
                price: 15.00,
                movieId: 'movie-uuid-123',
                room: 'Screen 1',
                showTime: new Date('2026-05-20T20:00:00Z'),
            }
        ]
    };
};

Deno.test(
    '[Unit] - GetOrderByBookingIdUseCase - execute - valid input - returns read model',
    async () => {
        // Arrange
        const bookingIdString = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
        const expectedReadModel = createMockReadModel(bookingIdString);
        let queryCalledWith: string | null = null;

        const mockQueryPort: GetOrderByBookingIdQueryPort = {
            getOrderByBookingId: (bookingId: string) => {
                queryCalledWith = bookingId;
                // Wrapping the valid read model inside the expected Optional wrapper
                return Promise.resolve(Optional.of<OrderByBookingIdReadModel>(expectedReadModel));
            }
        };

        const useCase = new GetOrderByBookingIdUseCase(mockQueryPort, mockLogger);
        const input: GetOrderByBookingIdInput = { bookingId: bookingIdString };

        // Act
        const result = await useCase.execute(input);

        // Assert
        assertEquals(queryCalledWith, bookingIdString);
        assertEquals(result, expectedReadModel);
    }
);

Deno.test(
    '[Unit] - GetOrderByBookingIdUseCase - execute - failure scenarios',
    async (t) => {
        const bookingIdString = 'missing-booking-id-uuid';

        await t.step('throws when order for booking id does not exist', async () => {
            // Arrange
            const mockQueryPort: GetOrderByBookingIdQueryPort = {
                getOrderByBookingId: (_bookingId: string) => 
                    // Simulating an empty search result using the Optional utility
                    Promise.resolve(Optional.empty<OrderByBookingIdReadModel>())
            };

            const useCase = new GetOrderByBookingIdUseCase(mockQueryPort, mockLogger);
            const input: GetOrderByBookingIdInput = { bookingId: bookingIdString };

            // Act & Assert
            await assertRejects(
                async () => await useCase.execute(input),
                OrderForBookingNotFoundApplicationException
            );
        });
    }
);