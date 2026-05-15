import { InvalidSeatNumberException, Seat, VisitorType } from '@/Domain/Ticketing/Orders/mod.ts';
import { assertEquals, assertThrows } from '@std/assert';

Deno.test('[Unit] - Seat - create - valid input - returns instance', () => {
    // Arrange
    const seatNumber = 42;
    const type = VisitorType.Standard;

    // Act
    const seat = Seat.create(seatNumber, type);

    // Assert
    assertEquals(seat.seatNumber, seatNumber);
    assertEquals(seat.visitorType, type);
});

Deno.test('[Unit] - Seat - create - valid discounted type - returns instance', () => {
    // Act
    const seat = Seat.create(10, VisitorType.Discounted);

    // Assert
    assertEquals(seat.visitorType, VisitorType.Discounted);
});

Deno.test('[Unit] - Seat - create - seat number 0 - throws InvalidSeatNumberException', () => {
    // Act & Assert
    assertThrows(
        () => Seat.create(0, VisitorType.Standard),
        InvalidSeatNumberException,
        'Seat number must be at least 1. Received: 0'
    );
});

Deno.test('[Unit] - Seat - create - negative seat number - throws InvalidSeatNumberException', () => {
    // Act & Assert
    assertThrows(
        () => Seat.create(-5, VisitorType.Standard),
        InvalidSeatNumberException,
        'Seat number must be at least 1. Received: -5'
    );
});

Deno.test('[Unit] - Seat - equals - identical seat number and type - returns true', () => {
    // Arrange
    const seat1 = Seat.create(15, VisitorType.Standard);
    const seat2 = Seat.create(15, VisitorType.Standard);

    // Act & Assert
    assertEquals(seat1.equals(seat2), true);
});

Deno.test('[Unit] - Seat - equals - different seat number - returns false', () => {
    // Arrange
    const seat1 = Seat.create(15, VisitorType.Standard);
    const seat2 = Seat.create(16, VisitorType.Standard);

    // Act & Assert
    assertEquals(seat1.equals(seat2), false);
});

Deno.test('[Unit] - Seat - equals - different visitor type - returns false', () => {
    // Arrange
    const seat1 = Seat.create(15, VisitorType.Standard);
    const seat2 = Seat.create(15, VisitorType.Discounted);

    // Act & Assert
    assertEquals(seat1.equals(seat2), false);
});

Deno.test('[Unit] - Seat - equals - different type - returns false', () => {
    // Arrange
    const seat = Seat.create(15, VisitorType.Standard);
    const other = { _seatNumber: 15, _visitorType: VisitorType.Standard } as any;

    // Act & Assert
    assertEquals(seat.equals(other), false);
});