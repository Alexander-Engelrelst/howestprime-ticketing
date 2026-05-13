import { assertEquals, assertThrows } from '@std/assert';
import { MovieTitle, InvalidMovieTitleException } from '@/Domain/Ticketing/Movies/mod.ts';

Deno.test('[Unit] - MovieTitle - create - valid title - returns normalized value object', () => {
    // Arrange
    const rawTitle = '   Inception   ';

    // Act
    const movieTitle = MovieTitle.create(rawTitle);

    // Assert
    assertEquals(movieTitle.value, 'Inception');
});

Deno.test('[Unit] - MovieTitle - create - empty string - throws InvalidMovieTitleException', () => {
    // Arrange
    const emptyTitle = '';

    // Act & Assert
    assertThrows(
        () => MovieTitle.create(emptyTitle),
        InvalidMovieTitleException
    );
});

Deno.test('[Unit] - MovieTitle - create - whitespace only - throws InvalidMovieTitleException', () => {
    // Arrange
    const whitespaceTitle = '    ';

    // Act & Assert
    assertThrows(
        () => MovieTitle.create(whitespaceTitle),
        InvalidMovieTitleException
    );
});

Deno.test('[Unit] - MovieTitle - equals - identical normalized values - returns true', () => {
    // Arrange
    const title = 'The Matrix';
    const left = MovieTitle.create(title);
    const right = MovieTitle.create(`  ${title}  `);

    // Act
    const result = left.equals(right);

    // Assert
    assertEquals(result, true);
});

Deno.test('[Unit] - MovieTitle - equals - different values - returns false', () => {
    // Arrange
    const left = MovieTitle.create('Interstellar');
    const right = MovieTitle.create('Tenet');

    // Act
    const result = left.equals(right);

    // Assert
    assertEquals(result, false);
});

Deno.test('[Unit] - MovieTitle - equals - null comparison - returns false', () => {
    // Arrange
    const movieTitle = MovieTitle.create('Pulp Fiction');

    // Act
    // @ts-ignore: Testing runtime safety
    const result = movieTitle.equals(null);

    // Assert
    assertEquals(result, false);
});

Deno.test('[Unit] - MovieTitle - value getter - returns internal value', () => {
    // Arrange
    const expected = 'The Godfather';
    const movieTitle = MovieTitle.create(expected);

    // Act
    const result = movieTitle.value;

    // Assert
    assertEquals(result, expected);
});

Deno.test('[Unit] - InvalidMovieTitleException - manual instantiation - hits non-empty branch', () => {
    const error = new InvalidMovieTitleException("Some Specific Error");
    assertEquals(error.message, "MovieTitle has invalid value: 'Some Specific Error'");
});