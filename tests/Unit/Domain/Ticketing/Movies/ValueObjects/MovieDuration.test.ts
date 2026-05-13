import { assertEquals, assertThrows } from '@std/assert';
import { MovieDuration, InvalidMovieDurationException } from '@/Domain/Ticketing/Movies/mod.ts';

Deno.test('[Unit] - MovieDuration - create - valid integer - returns value object', () => {
    // Arrange
    const rawDuration = 120;

    // Act
    const duration = MovieDuration.create(rawDuration);

    // Assert
    assertEquals(duration.value, 120);
});

Deno.test('[Unit] - MovieDuration - create - negative value - throws InvalidMovieDurationException', () => {
    // Arrange
    const invalidValue = -5;

    // Act & Assert
    assertThrows(
        () => MovieDuration.create(invalidValue),
        InvalidMovieDurationException,
        "MovieDuration has invalid value: '-5'"
    );
});

Deno.test('[Unit] - MovieDuration - create - zero value - throws InvalidMovieDurationException', () => {
    // Arrange
    const invalidValue = 0;

    // Act & Assert
    assertThrows(
        () => MovieDuration.create(invalidValue),
        InvalidMovieDurationException
    );
});

Deno.test('[Unit] - MovieDuration - create - non-integer value - throws InvalidMovieDurationException', () => {
    // Arrange
    const floatValue = 90.5;

    // Act & Assert
    assertThrows(
        () => MovieDuration.create(floatValue),
        InvalidMovieDurationException
    );
});

Deno.test('[Unit] - MovieDuration - intermission - value below threshold - returns zero', () => {
    // Arrange
    const duration = MovieDuration.create(99);

    // Act
    const intermission = duration.intermission;

    // Assert
    assertEquals(intermission, 0);
});

Deno.test('[Unit] - MovieDuration - intermission - value at threshold - returns mandatory duration', () => {
    // Arrange
    const duration = MovieDuration.create(100);

    // Act
    const intermission = duration.intermission;

    // Assert
    assertEquals(intermission, 10);
});

Deno.test('[Unit] - MovieDuration - intermission - value above threshold - returns mandatory duration', () => {
    // Arrange
    const duration = MovieDuration.create(150);

    // Act
    const intermission = duration.intermission;

    // Assert
    assertEquals(intermission, 10);
});

Deno.test('[Unit] - MovieDuration - equals - identical values - returns true', () => {
    // Arrange
    const left = MovieDuration.create(120);
    const right = MovieDuration.create(120);

    // Act
    const result = left.equals(right);

    // Assert
    assertEquals(result, true);
});

Deno.test('[Unit] - MovieDuration - equals - different values - returns false', () => {
    // Arrange
    const left = MovieDuration.create(120);
    const right = MovieDuration.create(90);

    // Act
    const result = left.equals(right);

    // Assert
    assertEquals(result, false);
});