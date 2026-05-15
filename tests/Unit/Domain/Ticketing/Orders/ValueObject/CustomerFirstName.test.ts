import { assertEquals, assertThrows } from '@std/assert';
import { CustomerFirstName, InvalidCustomerFirstNameException } from '@/Domain/Ticketing/Orders/ValueObject/CustomerFirstName.ts';

Deno.test('[Unit] - CustomerFirstName - create - valid name - creates instance with trimmed value', () => {
    // Arrange
    const validName = '  John  ';

    // Act
    const firstName = CustomerFirstName.create(validName);

    // Assert
    assertEquals(firstName.value, 'John');
});

Deno.test('[Unit] - CustomerFirstName - create - empty name - throws InvalidCustomerFirstNameException', () => {
    // Arrange
    const emptyName = '   ';

    // Act & Assert
    assertThrows(
        () => CustomerFirstName.create(emptyName),
        InvalidCustomerFirstNameException,
        `CustomerFirstName has invalid value: '[Empty or Whitespace]'`
    );
});

Deno.test('[Unit] - CustomerFirstName - equals - same value - returns true', () => {
    // Arrange
    const name1 = CustomerFirstName.create('Alice');
    const name2 = CustomerFirstName.create('Alice');

    // Act & Assert
    assertEquals(name1.equals(name2), true);
});

Deno.test('[Unit] - CustomerFirstName - equals - different value - returns false', () => {
    // Arrange
    const name1 = CustomerFirstName.create('Alice');
    const name2 = CustomerFirstName.create('Bob');

    // Act & Assert
    assertEquals(name1.equals(name2), false);
});

Deno.test('[Unit] - InvalidCustomerFirstNameException - constructor - empty or whitespace - formats message correctly', () => {
    const exception = new InvalidCustomerFirstNameException('   ');
    assertEquals(exception.message, "CustomerFirstName has invalid value: '[Empty or Whitespace]'");
});

Deno.test('[Unit] - InvalidCustomerFirstNameException - constructor - string with content - formats message correctly', () => {
    const exception = new InvalidCustomerFirstNameException('InvalidValue');
    assertEquals(exception.message, "CustomerFirstName has invalid value: 'InvalidValue'");
});

