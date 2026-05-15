import { assertEquals, assertThrows } from '@std/assert';
import { IllegalArgumentException } from '@domaincrafters/std';
import { RoomName } from '@/Domain/Ticketing/Orders/mod.ts';

Deno.test('[Unit] - RoomName - create - valid input - returns instance', () => {
    // Arrange
    const name = 'IMAX Screen 1';

    // Act
    const roomName = RoomName.create(name);

    // Assert
    assertEquals(roomName.value, name);
});

Deno.test('[Unit] - RoomName - create - trims whitespace', () => {
    // Arrange
    const untrimmed = '  Standard Screen  ';

    // Act
    const roomName = RoomName.create(untrimmed);

    // Assert
    assertEquals(roomName.value, 'Standard Screen');
});

Deno.test('[Unit] - RoomName - create - empty string - throws IllegalArgumentException', () => {
    // Act & Assert
    assertThrows(
        () => RoomName.create(''),
        IllegalArgumentException,
        'Room name cannot be empty'
    );
});

Deno.test('[Unit] - RoomName - create - whitespace only - throws IllegalArgumentException', () => {
    // Act & Assert
    // Because .trim() is called, "   " becomes "" which triggers validation
    assertThrows(
        () => RoomName.create('   '),
        IllegalArgumentException,
        'Room name cannot be empty'
    );
});

Deno.test('[Unit] - RoomName - equals - same value - returns true', () => {
    // Arrange
    const name1 = RoomName.create('Screen 1');
    const name2 = RoomName.create('Screen 1');

    // Act & Assert
    assertEquals(name1.equals(name2), true);
});

Deno.test('[Unit] - RoomName - equals - different value - returns false', () => {
    // Arrange
    const name1 = RoomName.create('Screen 1');
    const name2 = RoomName.create('Screen 2');

    // Act & Assert
    assertEquals(name1.equals(name2), false);
});

Deno.test('[Unit] - RoomName - equals - different type - returns false', () => {
    // Arrange
    const name = RoomName.create('Screen 1');
    const other = { value: 'Screen 1' } as any;

    // Act & Assert
    assertEquals(name.equals(other), false);
});