import { assertEquals, assertThrows } from '@std/assert';
import { CVV, InvalidCVVException } from '@/Domain/Ticketing/Payments/mod.ts';

Deno.test('[Unit] - CVV - create - valid 3-digit value - returns value object', () => {
    const cvv = CVV.create('123');

    assertEquals(cvv.value, '123');
});

Deno.test('[Unit] - CVV - create - valid 4-digit value with whitespace - returns trimmed value object', () => {
    const cvv = CVV.create(' 1234 ');

    assertEquals(cvv.value, '1234');
});

Deno.test('[Unit] - CVV - create - empty value - throws InvalidCVVException', () => {
    assertThrows(
        () => CVV.create('   '),
        InvalidCVVException,
        "CVV has invalid value: 'received empty or contains only whitespace'",
    );
});

Deno.test('[Unit] - CVV - create - invalid format - throws InvalidCVVException', () => {
    assertThrows(
        () => CVV.create('12a'),
        InvalidCVVException,
        "CVV has invalid value: 'must be 3 or 4 digits'",
    );
});

Deno.test('[Unit] - CVV - equals - same value - returns true', () => {
    const left = CVV.create('123');
    const right = CVV.create('123');

    assertEquals(left.equals(right), true);
});

Deno.test('[Unit] - CVV - equals - different value - returns false', () => {
    const left = CVV.create('123');
    const right = CVV.create('456');

    assertEquals(left.equals(right), false);
});
