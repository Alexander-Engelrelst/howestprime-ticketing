import { assertEquals } from '@std/assert';

import type { Logger } from '@/Application/Ports/mod.ts';

import { SaveMovieUseCase } from '@/Application/Ticketing/Movies/mod.ts';

import { createMockUnitOfWork } from '@/tests/Unit/Application/Shared/mod.ts';

const mockLogger: Logger = {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
};

Deno.test(
    '[Unit] - SaveMovieUseCase - execute - valid input - creates and saves movie',
    async () => {
        // Arrange
        const unitOfWork = createMockUnitOfWork();
        const useCase = new SaveMovieUseCase(unitOfWork, mockLogger);

        // Act
        await useCase.execute({
            title: 'The Matrix',
            duration: 136,
            genres: ['Science Fiction', 'Action'],
            ageRating: 12,
            posterUrl: 'https://example.com/posters/the-matrix.jpg',
            movieId: '550e8400-e29b-41d4-a716-446655440000',
        });

        // Assert
        assertEquals(unitOfWork.doCalled, true);
        assertEquals(unitOfWork.doCallCount, 1);
        assertEquals(unitOfWork.saveCalled, true);
        assertEquals(unitOfWork.saveCallCount, 1);
        assertEquals(unitOfWork.trackedEntities.length, 1);
        assertEquals(unitOfWork.savedEntities.length, 1);
    },
);

Deno.test(
    '[Unit] - SaveMovieUseCase - execute - with multiple genres - creates and saves movie',
    async () => {
        // Arrange
        const unitOfWork = createMockUnitOfWork();
        const useCase = new SaveMovieUseCase(unitOfWork, mockLogger);

        // Act
        await useCase.execute({
            title: 'Inception',
            duration: 148,
            genres: ['Science Fiction', 'Action', 'Thriller', 'Mystery'],
            ageRating: 12,
            posterUrl: 'https://example.com/posters/inception.jpg',
            movieId: 'a1b2c3d4-e5f6-4a5b-6c7d-8e9f0a1b2c3d',
        });

        // Assert
        assertEquals(unitOfWork.doCalled, true);
        assertEquals(unitOfWork.saveCalled, true);
        assertEquals(unitOfWork.saveCallCount, 1);
        assertEquals(unitOfWork.trackedEntities.length, 1);
    },
);

Deno.test(
    '[Unit] - SaveMovieUseCase - execute - with different age rating - creates and saves movie',
    async () => {
        // Arrange
        const unitOfWork = createMockUnitOfWork();
        const useCase = new SaveMovieUseCase(unitOfWork, mockLogger);

        // Act
        await useCase.execute({
            title: 'Toy Story',
            duration: 81,
            genres: ['Animation', 'Family', 'Comedy'],
            ageRating: 0,
            posterUrl: 'https://example.com/posters/toy-story.jpg',
            movieId: 'f1e2d3c4-b5a6-4d5c-6b7a-8c9d0e1f2a3b',
        });

        // Assert
        assertEquals(unitOfWork.doCalled, true);
        assertEquals(unitOfWork.saveCalled, true);
        assertEquals(unitOfWork.saveCallCount, 1);
        assertEquals(unitOfWork.trackedEntities.length, 1);
    },
);

Deno.test(
    '[Unit] - SaveMovieUseCase - execute - transaction called with correct flow',
    async () => {
        // Arrange
        const unitOfWork = createMockUnitOfWork();
        const useCase = new SaveMovieUseCase(unitOfWork, mockLogger);

        // Act
        await useCase.execute({
            title: 'The Dark Knight',
            duration: 152,
            genres: ['Crime', 'Drama', 'Action'],
            ageRating: 12,
            posterUrl: 'https://example.com/posters/dark-knight.jpg',
            movieId: 'd4c3b2a1-9f8e-7d6c-5b4a-3c2d1e0f9a8b',
        });

        // Assert
        assertEquals(unitOfWork.getRepositoryCalled, false);
        assertEquals(unitOfWork.removeCalled, false);
        assertEquals(unitOfWork.doCalled, true);
        assertEquals(unitOfWork.saveCalled, true);
    },
);
