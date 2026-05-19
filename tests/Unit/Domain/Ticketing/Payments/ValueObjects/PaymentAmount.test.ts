import { assertEquals, assertThrows } from '@std/assert';
import { InvalidPaymentAmountException, PaymentAmount } from '@/Domain/Ticketing/Payments/mod.ts';

Deno.test('[Unit] - PaymentAmount - create - valid positive integer cents - returns value object', () => {
    const amount = PaymentAmount.create(1500);

    assertEquals(amount.value, 1500);
});

Deno.test('[Unit] - PaymentAmount - create - zero value - throws InvalidPaymentAmountException', () => {
    assertThrows(
        () => PaymentAmount.create(0),
        InvalidPaymentAmountException,
        'Payment amount must be a positive safe integer representing cents',
    );
});

Deno.test('[Unit] - PaymentAmount - create - negative value - throws InvalidPaymentAmountException', () => {
    assertThrows(
        () => PaymentAmount.create(-1),
        InvalidPaymentAmountException,
        'Payment amount must be a positive safe integer representing cents',
    );
});

Deno.test('[Unit] - PaymentAmount - create - decimal value - throws InvalidPaymentAmountException', () => {
    assertThrows(
        () => PaymentAmount.create(12.5),
        InvalidPaymentAmountException,
        'Payment amount must be a positive safe integer representing cents',
    );
});

Deno.test('[Unit] - PaymentAmount - create - exceeds max safe integer - throws InvalidPaymentAmountException', () => {
    assertThrows(
        () => PaymentAmount.create(Number.MAX_SAFE_INTEGER + 1),
        InvalidPaymentAmountException,
    );
});

Deno.test('[Unit] - PaymentAmount - equals - same value - returns true', () => {
    const left = PaymentAmount.create(1500);
    const right = PaymentAmount.create(1500);

    assertEquals(left.equals(right), true);
});

Deno.test('[Unit] - PaymentAmount - equals - different value - returns false', () => {
    const left = PaymentAmount.create(1500);
    const right = PaymentAmount.create(1700);

    assertEquals(left.equals(right), false);
});
