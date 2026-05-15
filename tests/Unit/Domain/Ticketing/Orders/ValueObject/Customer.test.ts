import { assertEquals } from '@std/assert';
import { Customer, CustomerFirstName, CustomerLastName, CustomerEmail, CustomerSalutation } from '@/Domain/Ticketing/Orders/mod.ts';

Deno.test('[Unit] - Customer - create - valid properties - creates instance', () => {
    const firstName = CustomerFirstName.create('John');
    const lastName = CustomerLastName.create('Doe');
    const email = CustomerEmail.create('john.doe@example.com');
    const salutation = CustomerSalutation.create('Mr.');

    const customer = Customer.create(firstName, lastName, email, salutation);

    assertEquals(customer.firstName, firstName);
    assertEquals(customer.lastName, lastName);
    assertEquals(customer.email, email);
    assertEquals(customer.salutation, salutation);
});

Deno.test('[Unit] - Customer - equals - same properties - returns true', () => {
    const firstName = CustomerFirstName.create('John');
    const lastName = CustomerLastName.create('Doe');
    const email = CustomerEmail.create('john.doe@example.com');
    const salutation = CustomerSalutation.create('Mr.');

    const customer1 = Customer.create(firstName, lastName, email, salutation);
    const customer2 = Customer.create(firstName, lastName, email, salutation);

    assertEquals(customer1.equals(customer2), true);
});

Deno.test('[Unit] - Customer - equals - different properties - returns false', () => {
    const firstName = CustomerFirstName.create('John');
    const lastName = CustomerLastName.create('Doe');
    const email = CustomerEmail.create('john.doe@example.com');
    const salutation1 = CustomerSalutation.create('Mr.');
    const salutation2 = CustomerSalutation.create('Mx');

    const customer1 = Customer.create(firstName, lastName, email, salutation1);
    const customer2 = Customer.create(firstName, lastName, email, salutation2);

    assertEquals(customer1.equals(customer2), false);
});