import { assertEquals, assertThrows } from '@std/assert';
import { AgeRating, InvalidAgeRatingException } from '@/Domain/Ticketing/Movies/mod.ts';

Deno.test('[Unit] - AgeRating - create - valid boundary values - returns value object', () => {
    // Arrange
    const min = 0;
    const max = 18;

    // Act
    const minRating = AgeRating.create(min);
    const maxRating = AgeRating.create(max);

    // Assert
    assertEquals(minRating.value, 0);
    assertEquals(maxRating.value, 18);
});

Deno.test('[Unit] - AgeRating - create - value within range - returns value object', () => {
    // Arrange
    const rawValue = 12;

    // Act
    const ageRating = AgeRating.create(rawValue);

    // Assert
    assertEquals(ageRating.value, 12);
});

Deno.test('[Unit] - AgeRating - create - value below minimum - throws InvalidAgeRatingException', () => {
    // Arrange
    const invalidValue = -1;

    // Act & Assert
    assertThrows(
        () => AgeRating.create(invalidValue),
        InvalidAgeRatingException,
        "AgeRating must be an integer between 0 and 18"
    );
});

Deno.test('[Unit] - AgeRating - create - value above maximum - throws InvalidAgeRatingException', () => {
    // Arrange
    const invalidValue = 19;

    // Act & Assert
    assertThrows(
        () => AgeRating.create(invalidValue),
        InvalidAgeRatingException,
        "AgeRating must be an integer between 0 and 18"
    );
});

Deno.test('[Unit] - AgeRating - create - non-integer value - throws InvalidAgeRatingException', () => {
    // Arrange
    const decimalValue = 12.5;

    // Act & Assert
    assertThrows(
        () => AgeRating.create(decimalValue),
        InvalidAgeRatingException
    );
});

Deno.test('[Unit] - AgeRating - equals - identical values - returns true', () => {
    // Arrange
    const left = AgeRating.create(14);
    const right = AgeRating.create(14);

    // Act
    const result = left.equals(right);

    // Assert
    assertEquals(result, true);
});

Deno.test('[Unit] - AgeRating - equals - different values - returns false', () => {
    // Arrange
    const left = AgeRating.create(6);
    const right = AgeRating.create(18);

    // Act
    const result = left.equals(right);

    // Assert
    assertEquals(result, false);
});

Deno.test('[Unit] - AgeRating - equals - comparison with null - returns false', () => {
    // Arrange
    const ageRating = AgeRating.create(10);

    // Act
    // @ts-ignore: Testing runtime safety
    const result = ageRating.equals(null);

    // Assert
    assertEquals(result, false);
});