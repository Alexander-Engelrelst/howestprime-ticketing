import { assertEquals, assertThrows } from '@std/assert';
import { CustomerSalutation, InvalidCustomerSalutationException } from '@/Domain/Ticketing/Orders/ValueObject/CustomerSalutation.ts';

Deno.test('[Unit] - CustomerSalutation - create - valid salutation - creates instance with trimmed value', () => {
    const salutation = CustomerSalutation.create(' Mr. ');
    assertEquals(salutation.equals(CustomerSalutation.create('Mr.')), true);
});

Deno.test('[Unit] - CustomerSalutation - create - empty salutation - throws InvalidCustomerSalutationException', () => {
    assertThrows(
        () => CustomerSalutation.create('   '),
        InvalidCustomerSalutationException,
        `Invalid salutation: Received [empty or whitespace]. Must be one of the following: Mr., Ms., Mx.`
    );
});

Deno.test('[Unit] - CustomerSalutation - create - invalid salutation - throws InvalidCustomerSalutationException', () => {
    assertThrows(
        () => CustomerSalutation.create('Dr.'),
        InvalidCustomerSalutationException,
        `Invalid salutation: Received "Dr.". Must be one of the following: Mr., Ms., Mx.`
    );
});

Deno.test('[Unit] - CustomerSalutation - equals - same value - returns true', () => {
    const s1 = CustomerSalutation.create('Ms.');
    const s2 = CustomerSalutation.create('Ms.');
    assertEquals(s1.equals(s2), true);
});

Deno.test('[Unit] - CustomerSalutation - equals - different value - returns false', () => {
    const s1 = CustomerSalutation.create('Ms.');
    const s2 = CustomerSalutation.create('Mr.');
    assertEquals(s1.equals(s2), false);
});