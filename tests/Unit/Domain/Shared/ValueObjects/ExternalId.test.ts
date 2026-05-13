import { assertEquals, assertThrows } from '@std/assert';
import { ExternalId, InvalidExternalIdException } from '@/Domain/Shared/mod.ts';

Deno.test('[Unit] - ExternalId - create - valid uuid - returns value object', () => {
    // Arrange
    const rawId = '550e8400-e29b-41d4-a716-446655440000';

    // Act
    const externalId = ExternalId.create(rawId);

    // Assert
    assertEquals(externalId.value, rawId);
});

Deno.test('[Unit] - ExternalId - create - uppercase uuid - returns value object', () => {
    // Arrange
    const rawId = '550E8400-E29B-41D4-A716-446655440000';

    // Act
    const externalId = ExternalId.create(rawId);

    // Assert
    // Note: If you add normalization to lowerCase in your class, update this assertion.
    assertEquals(externalId.value, rawId);
});

Deno.test('[Unit] - ExternalId - create - invalid format - throws InvalidExternalIdException', () => {
    // Arrange
    const invalidId = 'not-a-valid-uuid';

    // Act & Assert
    assertThrows(
        () => ExternalId.create(invalidId),
        InvalidExternalIdException,
        "is not a valid UUID format"
    );
});

Deno.test('[Unit] - ExternalId - create - empty input - throws InvalidExternalIdException', () => {
    // Arrange
    const invalidId = '';

    // Act & Assert
    assertThrows(
        () => ExternalId.create(invalidId),
        InvalidExternalIdException
    );
});

Deno.test('[Unit] - ExternalId - equals - identical values - returns true', () => {
    // Arrange
    const uuid = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    const left = ExternalId.create(uuid);
    const right = ExternalId.create(uuid);

    // Act
    const result = left.equals(right);

    // Assert
    assertEquals(result, true);
});

Deno.test('[Unit] - ExternalId - equals - different values - returns false', () => {
    // Arrange
    const left = ExternalId.create('f47ac10b-58cc-4372-a567-0e02b2c3d479');
    const right = ExternalId.create('00000000-0000-0000-0000-000000000000');

    // Act
    const result = left.equals(right);

    // Assert
    assertEquals(result, false);
});