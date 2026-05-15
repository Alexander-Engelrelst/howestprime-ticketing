import { assertEquals } from '@std/assert';
import { ShowTime } from '@/Domain/Ticketing/Orders/mod.ts';

Deno.test('[Unit] - ShowTime - create - valid date - returns instance with correct value', () => {
    // Arrange
    const now = new Date();

    // Act
    const showTime = ShowTime.create(now);

    // Assert
    assertEquals(showTime.value.getTime(), now.getTime());
    assertInstanceOf(showTime.value, Date);
});

Deno.test('[Unit] - ShowTime - equals - identical timestamps - returns true', () => {
    // Arrange
    const dateStr = '2026-05-15T20:00:00Z';
    const time1 = ShowTime.create(new Date(dateStr));
    const time2 = ShowTime.create(new Date(dateStr));

    // Act & Assert
    // These are different objects in memory, but have the same value
    assertEquals(time1.equals(time2), true);
});

Deno.test('[Unit] - ShowTime - equals - different timestamps - returns false', () => {
    // Arrange
    const time1 = ShowTime.create(new Date('2026-05-15T20:00:00Z'));
    const time2 = ShowTime.create(new Date('2026-05-15T22:00:00Z'));

    // Act & Assert
    assertEquals(time1.equals(time2), false);
});

Deno.test('[Unit] - ShowTime - equals - different types - returns false', () => {
    // Arrange
    const now = new Date();
    const showTime = ShowTime.create(now);
    const other = { _value: now } as any;

    // Act & Assert
    assertEquals(showTime.equals(other), false);
});

Deno.test('[Unit] - ShowTime - value getter - provides access to underlying Date', () => {
    // Arrange
    const date = new Date('2026-12-25T18:30:00');
    const showTime = ShowTime.create(date);

    // Act
    const result = showTime.value;

    // Assert
    assertEquals(result.getFullYear(), 2026);
    assertEquals(result.getMonth(), 11); // December is 11 in JS Dates
    assertEquals(result.getDate(), 25);
});

// Helper for type checking
function assertInstanceOf(actual: unknown, expectedType: Function) {
    if (!(actual instanceof expectedType)) {
        throw new Error(`Expected instance of ${expectedType.name} but got ${typeof actual}`);
    }
}