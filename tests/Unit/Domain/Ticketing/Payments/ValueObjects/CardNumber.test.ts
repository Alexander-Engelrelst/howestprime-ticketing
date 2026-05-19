import { assertEquals, assertThrows } from '@std/assert';
import { CardNumber, InvalidCardNumberException } from '@/Domain/Ticketing/Payments/mod.ts';

Deno.test('[Unit] - CardNumber - create - valid value with whitespace - returns trimmed value object', () => {
    const cardNumber = CardNumber.create('  4111111111111111  ');

    assertEquals(cardNumber.value, '4111111111111111');
});

Deno.test('[Unit] - CardNumber - create - empty value - throws InvalidCardNumberException', () => {
    assertThrows(
        () => CardNumber.create('   '),
        InvalidCardNumberException,
        "CardNumber has invalid value: 'Card number is empty or contains only whitespace'",
    );
});

Deno.test('[Unit] - CardNumber - create - too short - throws InvalidCardNumberException', () => {
    assertThrows(
        () => CardNumber.create('12345678901'),
        InvalidCardNumberException,
        'CardNumber has invalid value',
    );
});

Deno.test('[Unit] - CardNumber - create - too long - throws InvalidCardNumberException', () => {
    assertThrows(
        () => CardNumber.create('12345678901234567890'),
        InvalidCardNumberException,
        'CardNumber has invalid value',
    );
});

Deno.test('[Unit] - CardNumber - create - non-digit characters - throws InvalidCardNumberException', () => {
    assertThrows(
        () => CardNumber.create('4111-1111-1111-1111'),
        InvalidCardNumberException,
        "CardNumber has invalid value: 'Card number contains invalid characters (only digits are allowed)'",
    );
});

Deno.test('[Unit] - CardNumber - equals - same value - returns true', () => {
    const left = CardNumber.create('4111111111111111');
    const right = CardNumber.create('4111111111111111');

    assertEquals(left.equals(right), true);
});

Deno.test('[Unit] - CardNumber - equals - different value - returns false', () => {
    const left = CardNumber.create('4111111111111111');
    const right = CardNumber.create('5555555555554444');

    assertEquals(left.equals(right), false);
});
