import { assertEquals } from '@std/assert';

import type { Logger } from '@/Application/Ports/mod.ts';

import { ChangeMovieDetailsUseCase } from '@/Application/Ticketing/Movies/mod.ts';
import { AgeRating, Genre, Movie, MovieDuration, MovieId, MovieTitle, PosterUrl } from '@/Domain/Ticketing/Movies/mod.ts';
import { createMockUnitOfWork } from '@/tests/Unit/Application/Shared/mod.ts';

const mockLogger: Logger = {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
};

function createTestMovie(): Movie {
    return Movie.create(
        MovieId.create('550e8400-e29b-41d4-a716-446655440000'),
        MovieTitle.create('The Matrix'),
        MovieDuration.create(136),
        ['Action', 'Sci-Fi'].map(Genre.create),
        AgeRating.create(16),
        PosterUrl.create('https://example.com/poster-original.jpg'),
    );
}

Deno.test('[Unit] - ChangeMovieDetailsUseCase - execute - existing movie updates details and persists movie', async () => {
    const movie = createTestMovie();
    const movieRepository = {
        byId: () => Promise.resolve({ isPresent: true, value: movie }),
        save: (_movie: Movie) => Promise.resolve(),
    };

    const unitOfWork = createMockUnitOfWork({
        repositories: new Map<string, any>([[Movie.name, movieRepository]]),
    });
    const useCase = new ChangeMovieDetailsUseCase(unitOfWork, mockLogger);

    await useCase.execute({
        movieId: '550e8400-e29b-41d4-a716-446655440000',
        title: 'The Matrix Reloaded',
        duration: 138,
        genres: ['Action', 'Sci-Fi', 'Thriller'],
        ageRating: 16,
        posterUrl: 'https://example.com/poster-updated.jpg',
    });

    assertEquals(unitOfWork.doCalled, true);
    assertEquals(unitOfWork.doCallCount, 1);
    assertEquals(unitOfWork.getRepositoryCalled, true);
    assertEquals(unitOfWork.getRepositoryCallCount, 1);
    assertEquals(unitOfWork.saveCalled, true);
    assertEquals(unitOfWork.saveCallCount, 1);
    assertEquals(movie.title.value, 'The Matrix Reloaded');
    assertEquals(movie.duration.value, 138);
    assertEquals(movie.genres.map((genre) => genre.value), ['Action', 'Sci-Fi', 'Thriller']);
    assertEquals(movie.ageRating.value, 16);
    assertEquals(movie.posterUrl.value, 'https://example.com/poster-updated.jpg');
    assertEquals(movie.price.value, 138 * 15);
});

Deno.test('[Unit] - ChangeMovieDetailsUseCase - execute - missing movie does not persist', async () => {
    const movieRepository = {
        byId: () => Promise.resolve({ isPresent: false }),
        save: (_movie: Movie) => Promise.resolve(),
    };

    const unitOfWork = createMockUnitOfWork({
        repositories: new Map<string, any>([[Movie.name, movieRepository]]),
    });
    const useCase = new ChangeMovieDetailsUseCase(unitOfWork, mockLogger);

    await useCase.execute({
        movieId: '550e8400-e29b-41d4-a716-446655440099',
        title: 'The Matrix Reloaded',
        duration: 138,
        genres: ['Action', 'Sci-Fi', 'Thriller'],
        ageRating: 16,
        posterUrl: 'https://example.com/poster-updated.jpg',
    });

    assertEquals(unitOfWork.doCalled, true);
    assertEquals(unitOfWork.getRepositoryCalled, true);
    assertEquals(unitOfWork.saveCalled, false);
    assertEquals(unitOfWork.saveCallCount, 0);
});