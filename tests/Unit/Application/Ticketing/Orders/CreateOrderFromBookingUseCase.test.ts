import { assertEquals, assertRejects } from '@std/assert';
import { MovieId, Movie, Genre, AgeRating, MovieDuration, MovieTitle, PosterUrl } from '@/Domain/Ticketing/Movies/mod.ts';
import { createMockUnitOfWork } from '@/tests/Unit/Application/Shared/mod.ts';
import type { Logger } from '@/Application/Ports/mod.ts';
import { CreateOrderFromBookingUseCase } from '@/Application/Ticketing/Orders/mod.ts';
import { TicketQuantityMismatchException } from '@/Domain/Ticketing/Orders/mod.ts';
import { MovieNotFoundApplicationException } from '@/Application/Shared/mod.ts'; 

const mockLogger: Logger = {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
};

const createMockMovieResult = (id: string, exists: boolean) => ({
    isPresent: exists,
    value: exists 
        ? Movie.create(
            MovieId.create(id),
            MovieTitle.create('Inception'),
            MovieDuration.create(120),
            [Genre.create('Action')],
            AgeRating.create(12),
            PosterUrl.create('https://example.com/poster.jpg')
          )
        : null
});

// --- SUCCESS CASE ---
Deno.test('[Unit] - CreateOrderFromBookingUseCase - execute - valid input', async () => {
    const movieRepository = {
        byId: (id: MovieId) => Promise.resolve(createMockMovieResult(id.value, true))
    };
    const unitOfWork = createMockUnitOfWork({
        repositories: new Map<string, any>([[Movie.name, movieRepository]])
    });
    const useCase = new CreateOrderFromBookingUseCase(unitOfWork, mockLogger);

    await useCase.execute({
        bookingId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        movieId: '550e8400-e29b-41d4-a716-446655440000',
        room: 'Screen 1',
        showTime: new Date(),
        numberOfStandardTickets: 2,
        numberOfDiscountedTickets: 1,
        seatNumbers: [10, 11, 12],
    });

    assertEquals(unitOfWork.doCalled, true);
    assertEquals(unitOfWork.saveCalled, true);
});

// --- APPLICATION ERRORS (404) ---
Deno.test('[Unit] - CreateOrderFromBookingUseCase - execute - movie does not exist', async () => {
    const movieRepository = {
        byId: (id: MovieId) => Promise.resolve(createMockMovieResult(id.value, false)) // Exists is FALSE
    };
    const unitOfWork = createMockUnitOfWork({
        repositories: new Map<string, any>([[Movie.name, movieRepository]])
    });
    const useCase = new CreateOrderFromBookingUseCase(unitOfWork, mockLogger);

    await assertRejects(
        async () => await useCase.execute({
            bookingId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
            movieId: '550e8400-e29b-41d4-a716-446655440000',
            room: 'Screen 1',
            showTime: new Date(),
            numberOfStandardTickets: 1,
            numberOfDiscountedTickets: 0,
            seatNumbers: [1],
        }),
        MovieNotFoundApplicationException
    );
});

// --- DOMAIN ERRORS (Logic Constraints) ---
Deno.test('[Unit] - CreateOrderFromBookingUseCase - execute - quantity mismatch', async (t) => {
    const movieRepository = {
        byId: (id: MovieId) => Promise.resolve(createMockMovieResult(id.value, true))
    };

    const unitOfWork = createMockUnitOfWork({
        repositories: new Map<string, any>([[Movie.name, movieRepository]])
    });
    const useCase = new CreateOrderFromBookingUseCase(unitOfWork, mockLogger);

    await t.step('throws when more tickets than seats', async () => {
        await assertRejects(
            async () => await useCase.execute({
                bookingId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
                movieId: '550e8400-e29b-41d4-a716-446655440000',
                room: 'Screen 1',
                showTime: new Date(),
                numberOfStandardTickets: 5, // Total 5
                numberOfDiscountedTickets: 0,
                seatNumbers: [10], // Only 1 seat
            }),
            TicketQuantityMismatchException
        );
    });

    await t.step('throws when more seats than tickets', async () => {
        await assertRejects(
            async () => await useCase.execute({
                bookingId: '...',
                movieId: '550e8400-e29b-41d4-a716-446655440000',
                room: 'Screen 1',
                showTime: new Date(),
                numberOfStandardTickets: 1, // Total 1
                numberOfDiscountedTickets: 0,
                seatNumbers: [10, 11, 12], // 3 seats
            }),
            TicketQuantityMismatchException
        );
    });
});