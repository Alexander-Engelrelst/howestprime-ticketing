import { assertEquals, assertRejects } from '@std/assert';
import { MovieId, Movie } from '@/Domain/Ticketing/Movies/mod.ts';
import { createMockUnitOfWork } from '@/tests/Unit/Application/Shared/mod.ts';
import type { Logger } from '@/Application/Ports/mod.ts';
import { CreateOrderFromBookingUseCase } from '@/Application/Ticketing/Orders/mod.ts';

const mockLogger: Logger = {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
};

const createMockMovieResult = (id: string, exists: boolean) => ({
    isPresent: exists,
    value: exists ? {
        id: MovieId.create(id),
        title: { value: 'Inception' },
        duration: { value: 120 },
        genres: [],
        ageRating: { value: 12 },
        posterUrl: { value: 'https://example.com/poster.jpg' },
        price: { value: 15.0 }
    } : null
});

Deno.test(
    '[Unit] - CreateOrderFromBookingUseCase - execute - valid input - creates and saves order',
    async () => {
        // Arrange
        const movieRepository = {
            byId: () => Promise.resolve(createMockMovieResult('550e8400-e29b-41d4-a716-446655440000', true))
        };

        const unitOfWork = createMockUnitOfWork({
            repositories: new Map<string, any>([[Movie.name, movieRepository]])
        });

        const useCase = new CreateOrderFromBookingUseCase(unitOfWork, mockLogger);

        // Act
        await useCase.execute({
            bookingId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
            movieId: '550e8400-e29b-41d4-a716-446655440000',
            room: 'Screen 1',
            showTime: new Date(),
            numberOfStandardTickets: 2,
            numberOfDiscountedTickets: 1,
            seatNumbers: [10, 11, 12],
        });

        // Assert
        assertEquals(unitOfWork.doCalled, true);
        assertEquals(unitOfWork.saveCalled, true);
    }
);

Deno.test(
    '[Unit] - CreateOrderFromBookingUseCase - execute - invalid values - throws domain error',
    async (t) => {
        const movieRepository = {
            byId: () => Promise.resolve(createMockMovieResult('550e8400-e29b-41d4-a716-446655440000', true))
        };
        const unitOfWork = createMockUnitOfWork({
            repositories: new Map<string, any>([[Movie.name, movieRepository]])
        });
        const useCase = new CreateOrderFromBookingUseCase(unitOfWork, mockLogger);

        await t.step('throws when room name is empty', async () => {
            await assertRejects(
                () => useCase.execute({
                    bookingId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
                    movieId: '550e8400-e29b-41d4-a716-446655440000',
                    room: '', // Invalid
                    showTime: new Date(),
                    numberOfStandardTickets: 1,
                    numberOfDiscountedTickets: 0,
                    seatNumbers: [1],
                })
            );
            assertEquals(unitOfWork.saveCalled, false);
        });

        await t.step('throws when seat numbers are empty', async () => {
            await assertRejects(
                () => useCase.execute({
                    bookingId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
                    movieId: '550e8400-e29b-41d4-a716-446655440000',
                    room: 'Screen 1',
                    showTime: new Date(),
                    numberOfStandardTickets: 1,
                    numberOfDiscountedTickets: 0,
                    seatNumbers: [], // Invalid per business logic
                })
            );
        });
    }
);

Deno.test(
    '[Unit] - CreateOrderFromBookingUseCase - execute - movie does not exist - throws error',
    async () => {
        const movieRepository = {
            byId: () => Promise.resolve(createMockMovieResult('550e8400-e29b-41d4-a716-446655440000', false))
        };
        const unitOfWork = createMockUnitOfWork({
            repositories: new Map<string, any>([[Movie.name, movieRepository]])
        });
        const useCase = new CreateOrderFromBookingUseCase(unitOfWork, mockLogger);

        await assertRejects(
            () => useCase.execute({
                bookingId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
                movieId: '550e8400-e29b-41d4-a716-446655440000',
                room: 'Screen 1',
                showTime: new Date(),
                numberOfStandardTickets: 1,
                numberOfDiscountedTickets: 0,
                seatNumbers: [1],
            })
        );
        assertEquals(unitOfWork.saveCalled, false);
    }
);
