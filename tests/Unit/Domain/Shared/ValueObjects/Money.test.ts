import { assertEquals, assertThrows } from '@std/assert';
import { InvalidMoneyException, Money } from '@/Domain/Shared/mod.ts';

Deno.test('[Unit] - Money - create - valid positive value - returns value object', () => {
    // Arrange
    const rawValue = 10050;

    // Act
    const money = Money.fromCents(rawValue);

    // Assert
    assertEquals(money.value, 10050);
});

Deno.test('[Unit] - Money - create - zero value - returns value object', () => {
    // Arrange
    const rawValue = 0;

    // Act
    const money = Money.fromCents(rawValue);

    // Assert
    assertEquals(money.value, 0);
});

Deno.test('[Unit] - Money - create - negative value - throws InvalidMoneyException', () => {
    // Arrange
    const invalidValue = -1;

    // Act & Assert
    assertThrows(
        () => Money.fromCents(invalidValue),
        InvalidMoneyException,
    );
});

Deno.test('[Unit] - Money - create - non-finite value - throws InvalidMoneyException', () => {
    // Arrange
    const invalidValue = Infinity;

    // Act & Assert
    assertThrows(
        () => Money.fromCents(invalidValue),
        InvalidMoneyException
    );
});

Deno.test('[Unit] - Money - create - exceeds MAX_SAFE_INTEGER - throws InvalidMoneyException', () => {
    // Arrange
    const invalidValue = Number.MAX_SAFE_INTEGER + 1;

    // Act & Assert
    assertThrows(
        () => Money.fromCents(invalidValue),
        InvalidMoneyException
    );
});

Deno.test('[Unit] - Money - equals - identical values - returns true', () => {
    // Arrange
    const left = Money.fromCents(50);
    const right = Money.fromCents(50);

    // Act
    const result = left.equals(right);

    // Assert
    assertEquals(result, true);
});

Deno.test('[Unit] - Money - equals - different values - returns false', () => {
    // Arrange
    const left = Money.fromCents(50);
    const right = Money.fromCents(100);

    // Act
    const result = left.equals(right);

    // Assert
    assertEquals(result, false);
});

Deno.test('[Unit] - Money - equals - null or undefined comparison - returns false', () => {
    // Arrange
    const money = Money.fromCents(25);

    // Act & Assert
    // @ts-ignore: Testing runtime safety for null/undefined
    assertEquals(money.equals(null), false);
    // @ts-ignore: Testing runtime safety for null/undefined
    assertEquals(money.equals(undefined), false);
});