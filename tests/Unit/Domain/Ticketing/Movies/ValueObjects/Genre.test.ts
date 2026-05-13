import { assertEquals, assertThrows } from '@std/assert';
import { Genre, InvalidGenreException } from '@/Domain/Ticketing/Movies/mod.ts';

Deno.test('[Unit] - Genre - create - valid string - returns normalized value object', () => {
    // Arrange
    const rawGenre = '  Sci-Fi  ';

    // Act
    const genre = Genre.create(rawGenre);

    // Assert
    assertEquals(genre.value, 'Sci-Fi');
});

Deno.test('[Unit] - Genre - create - empty string - throws InvalidGenreException', () => {
    // Arrange
    const emptyGenre = '';

    // Act & Assert
    assertThrows(
        () => Genre.create(emptyGenre),
        InvalidGenreException,
        "Genre has invalid value: '[Emtpy or Whitespace]'"
    );
});

Deno.test('[Unit] - Genre - create - whitespace only - throws InvalidGenreException', () => {
    // Arrange
    const whitespaceGenre = '   ';

    // Act & Assert
    assertThrows(
        () => Genre.create(whitespaceGenre),
        InvalidGenreException,
        "Genre has invalid value: '[Emtpy or Whitespace]'"
    );
});

Deno.test('[Unit] - Genre - equals - identical normalized values - returns true', () => {
    // Arrange
    const left = Genre.create('Drama');
    const right = Genre.create('  Drama  ');

    // Act
    const result = left.equals(right);

    // Assert
    assertEquals(result, true);
});

Deno.test('[Unit] - Genre - equals - different values - returns false', () => {
    // Arrange
    const left = Genre.create('Comedy');
    const right = Genre.create('Horror');

    // Act
    const result = left.equals(right);

    // Assert
    assertEquals(result, false);
});

Deno.test('[Unit] - Genre - equals - null comparison - returns false', () => {
    // Arrange
    const genre = Genre.create('Action');

    // Act
    // @ts-ignore: Testing runtime safety
    const result = genre.equals(null);

    // Assert
    assertEquals(result, false);
});

Deno.test('[Unit] - Genre - value getter - returns internal value', () => {
    // Arrange
    const expected = 'Thriller';
    const genre = Genre.create(expected);

    // Act
    const result = genre.value;

    // Assert
    assertEquals(result, expected);
});

Deno.test('[Unit] - InvalidGenreException - manual instantiation - covers non-empty branch', () => {
    const error = new InvalidGenreException("Custom Error");
    assertEquals(error.message, "Genre has invalid value: 'Custom Error'");
});