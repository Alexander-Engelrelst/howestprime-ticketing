import { assertEquals, assertThrows } from '@std/assert';
import { CustomerEmail, InvalidCustomerEmailException } from '@/Domain/Ticketing/Orders/ValueObject/CustomerEmail.ts';

Deno.test('[Unit] - CustomerEmail - create - valid email - creates instance with trimmed value', () => {
    const validEmail = ' test@example.com  ';
    const email = CustomerEmail.create(validEmail);
    assertEquals(email.value, 'test@example.com');
});

Deno.test('[Unit] - CustomerEmail - create - empty email - throws InvalidCustomerEmailException', () => {
    assertThrows(
        () => CustomerEmail.create('   '),
        InvalidCustomerEmailException,
        `CustomerEmail has invalid value: 'Email is empty or contains only whitespace'`
    );
});

Deno.test('[Unit] - CustomerEmail - create - invalid email format - throws InvalidCustomerEmailException', () => {
    assertThrows(
        () => CustomerEmail.create('invalid-email'),
        InvalidCustomerEmailException,
        `CustomerEmail has invalid value: 'Email has invalid format'`
    );
});

Deno.test('[Unit] - CustomerEmail - equals - same value - returns true', () => {
    const email1 = CustomerEmail.create('test@example.com');
    const email2 = CustomerEmail.create('test@example.com');
    assertEquals(email1.equals(email2), true);
});

Deno.test('[Unit] - CustomerEmail - equals - different value - returns false', () => {
    const email1 = CustomerEmail.create('test@example.com');
    const email2 = CustomerEmail.create('other@example.com');
    assertEquals(email1.equals(email2), false);
});