import { EmptyGenresListException, Movie, MovieId } from '@/Domain/Ticketing/Movies/mod.ts';
import { assert, assertEquals, assertThrows } from '@std/assert';

Deno.test('[Unit] - Movie - create - valid input - returns movie aggregate', () => {
    // Arrange
    const input = {
        title: 'Interstellar',
        duration: 169,
        genres: ['Sci-Fi', 'Drama'],
        ageRating: 13,
        posterUrl: 'https://example.com/poster.jpg',
        externalId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
    };

    // Act
    const movie = Movie.create(
        input.title,
        input.duration,
        input.genres,
        input.ageRating,
        input.posterUrl,
        input.externalId
    );

    // Assert
    assert(movie.id instanceof MovieId, 'Movie ID should be an instance of MovieId value object');
    assertEquals(movie.title.value, 'Interstellar');
    assertEquals(movie.duration.value, 169);
    assertEquals(movie.genres.length, 2);
    
    const genreValues = movie.genres.map(g => g.value);
    assertEquals(genreValues, ['Sci-Fi', 'Drama']);

    assertEquals(movie.ageRating.value, 13);
    assertEquals(movie.posterUrl.value, 'https://example.com/poster.jpg');
    assertEquals(movie.externalId.value, input.externalId);
});

Deno.test('[Unit] - Movie - create - calculation logic - sets correct price based on duration', () => {
    // Arrange
    const duration = 100;
    const expectedPrice = 100 * 0.15; // 15.0

    // Act
    const movie = Movie.create(
        'Inception',
        duration,
        ['Action'],
        13,
        'https://example.com/poster.jpg',
        'f47ac10b-58cc-4372-a567-0e02b2c3d479'
    );

    // Assert
    assertEquals(movie.price.value, expectedPrice);
});

Deno.test('[Unit] - Movie - create - empty genres list - throws EmptyGenresListException', () => {
    // Arrange
    const emptyGenres: string[] = [];

    // Act & Assert
    assertThrows(
        () => Movie.create(
            'Empty Genre Movie',
            120,
            emptyGenres,
            12,
            'https://example.com/poster.jpg',
            'f47ac10b-58cc-4372-a567-0e02b2c3d479'
        ),
        EmptyGenresListException
    );
});

Deno.test('[Unit] - Movie - genres getter - returns shallow copy to preserve immutability', () => {
    // Arrange
    const movie = Movie.create(
        'The Matrix',
        136,
        ['Action', 'Sci-Fi'],
        16,
        'https://example.com/poster.jpg',
        'f47ac10b-58cc-4372-a567-0e02b2c3d479'
    );

    // Act
    const genres = movie.genres;
    // Attempt to mutate the returned array (if this were possible, it shouldn't affect the aggregate)
    (genres as any).push('Romance'); 

    // Assert
    assertEquals(movie.genres.length, 2, 'Aggregate internal state should not be affected by external array mutation');
    assertEquals(genres !== movie.genres, true, 'Getter should return a new array instance');
});

Deno.test('[Unit] - Movie - create - invalid value object input - propagates internal validation errors', () => {
    // Arrange & Act & Assert
    // Providing an invalid URL should trigger the PosterUrl validation before the Movie is even created
    assertThrows(
        () => Movie.create(
            'Invalid Poster',
            120,
            ['Drama'],
            12,
            'not-a-url',
            'f47ac10b-58cc-4372-a567-0e02b2c3d479'
        )
    );
});