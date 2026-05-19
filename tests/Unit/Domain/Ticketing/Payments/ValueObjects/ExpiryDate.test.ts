import { assertEquals, assertThrows } from '@std/assert';
import { ExpiryDate, InvalidExpiryDateException } from '@/Domain/Ticketing/Payments/mod.ts';

Deno.test('[Unit] - ExpiryDate - create - valid MM/YY value - returns value object', () => {
    const expiryDate = ExpiryDate.create('12/30');

    assertEquals(expiryDate.value, '12/30');
});

Deno.test('[Unit] - ExpiryDate - create - valid MM/YYYY value with whitespace - returns trimmed value object', () => {
    const expiryDate = ExpiryDate.create(' 01/2030 ');

    assertEquals(expiryDate.value, '01/2030');
});

Deno.test('[Unit] - ExpiryDate - create - empty value - throws InvalidExpiryDateException', () => {
    assertThrows(
        () => ExpiryDate.create('   '),
        InvalidExpiryDateException,
        "Expiry date has invalid value: 'Expiry date is empty or contains only whitespace'",
    );
});

Deno.test('[Unit] - ExpiryDate - create - invalid month - throws InvalidExpiryDateException', () => {
    assertThrows(
        () => ExpiryDate.create('13/30'),
        InvalidExpiryDateException,
        "Expiry date has invalid value: 'Expiry date must be in the format MM/YY or MM/YYYY'",
    );
});

Deno.test('[Unit] - ExpiryDate - create - invalid format - throws InvalidExpiryDateException', () => {
    assertThrows(
        () => ExpiryDate.create('1/30'),
        InvalidExpiryDateException,
        "Expiry date has invalid value: 'Expiry date must be in the format MM/YY or MM/YYYY'",
    );
});

Deno.test('[Unit] - ExpiryDate - equals - same value - returns true', () => {
    const left = ExpiryDate.create('12/30');
    const right = ExpiryDate.create('12/30');

    assertEquals(left.equals(right), true);
});

Deno.test('[Unit] - ExpiryDate - equals - different value - returns false', () => {
    const left = ExpiryDate.create('12/30');
    const right = ExpiryDate.create('11/30');

    assertEquals(left.equals(right), false);
});
