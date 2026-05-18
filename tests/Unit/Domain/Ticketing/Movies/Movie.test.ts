import { AgeRating, Genre, Movie, MovieDuration, MovieId, MovieTitle, PosterUrl } from '@/Domain/Ticketing/Movies/mod.ts';
import { assert, assertEquals, assertThrows } from '@std/assert';
import { EmptyListException } from '@/Domain/Shared/mod.ts';

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
        MovieId.create(),
        MovieTitle.create(input.title),
        MovieDuration.create(input.duration),
        input.genres.map(Genre.create),
        AgeRating.create(input.ageRating),
        PosterUrl.create(input.posterUrl),
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
});

Deno.test('[Unit] - Movie - create - calculation logic - sets correct price based on duration', () => {
    // Arrange
    const duration = 100;
    const expectedPrice = 100 * 15; // 1500 cents

    // Act
    const movie = Movie.create(
        MovieId.create(),
        MovieTitle.create('Inception'),
        MovieDuration.create(duration),
        ['Action'].map(Genre.create),
        AgeRating.create(13),
        PosterUrl.create('https://example.com/poster.jpg'),
    );

    // Assert
    assertEquals(movie.price.value, expectedPrice);
});

Deno.test('[Unit] - Movie - create - empty genres list - throws EmptyGenresListException', () => {
    // Arrange
    const emptyGenres: Genre[] = [];

    // Act & Assert
    assertThrows(
        () => Movie.create(
            MovieId.create(),
            MovieTitle.create('Empty Genre Movie'),
            MovieDuration.create(120),
            emptyGenres,
            AgeRating.create(12),
            PosterUrl.create('https://example.com/poster.jpg')
        ),
        EmptyListException,
    );
});

Deno.test('[Unit] - Movie - genres getter - returns shallow copy to preserve immutability', () => {
    // Arrange
    const movie = Movie.create(
        MovieId.create(),
        MovieTitle.create('The Matrix'),
        MovieDuration.create(136),
        ['Action', 'Sci-Fi'].map(Genre.create),
        AgeRating.create(16),
        PosterUrl.create('https://example.com/poster.jpg'),
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
            MovieId.create(),
            MovieTitle.create('Invalid Poster'),
            MovieDuration.create(120),
            ['Drama'].map(Genre.create),
            AgeRating.create(12),
            PosterUrl.create('not-a-url'),
        )
    );
});