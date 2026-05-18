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
        `CustomerSalutation has invalid value. Allowed values are: Mr., Ms., Mx`
    );
});

Deno.test('[Unit] - CustomerSalutation - create - invalid salutation - throws InvalidCustomerSalutationException', () => {
    assertThrows(
        () => CustomerSalutation.create('Dr.'),
        InvalidCustomerSalutationException,
        `CustomerSalutation has invalid value. Allowed values are: Mr., Ms., Mx`
    );
});

Deno.test('[Unit] - CustomerSalutation - equals - same value - returns true', () => {
    const s1 = CustomerSalutation.create('Ms.');
    const s2 = CustomerSalutation.create('Ms.');
    assertEquals(s1.equals(s2), true);
    assertEquals(s1.value, 'Ms.');
});

Deno.test('[Unit] - CustomerSalutation - equals - different value - returns false', () => {
    const s1 = CustomerSalutation.create('Ms.');
    const s2 = CustomerSalutation.create('Mr.');
    assertEquals(s1.equals(s2), false);
    assertEquals(s2.value, 'Mr.');
});