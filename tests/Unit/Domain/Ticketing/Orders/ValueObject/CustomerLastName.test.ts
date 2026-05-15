import { assertEquals, assertThrows } from '@std/assert';
import { CustomerLastName, InvalidCustomerLastNameException } from '@/Domain/Ticketing/Orders/ValueObject/CustomerLastName.ts';

Deno.test('[Unit] - CustomerLastName - create - valid name - creates instance with trimmed value', () => {
    // Arrange
    const validName = '  Doe  ';

    // Act
    const lastName = CustomerLastName.create(validName);

    // Assert
    assertEquals(lastName.value, 'Doe');
});

Deno.test('[Unit] - CustomerLastName - create - empty name - throws InvalidCustomerLastNameException', () => {
    // Arrange
    const emptyName = '   ';

    // Act & Assert
    assertThrows(
        () => CustomerLastName.create(emptyName),
        InvalidCustomerLastNameException,
        `CustomerLastName has invalid value: '[Empty or Whitespace]'`
    );
});

Deno.test('[Unit] - CustomerLastName - equals - same value - returns true', () => {
    // Arrange
    const name1 = CustomerLastName.create('Smith');
    const name2 = CustomerLastName.create('Smith');

    // Act & Assert
    assertEquals(name1.equals(name2), true);
});

Deno.test('[Unit] - CustomerLastName - equals - different value - returns false', () => {
    // Arrange
    const name1 = CustomerLastName.create('Smith');
    const name2 = CustomerLastName.create('Johnson');

    // Act & Assert
    assertEquals(name1.equals(name2), false);
});

Deno.test('[Unit] - InvalidCustomerLastNameException - constructor - empty or whitespace - formats message correctly', () => {
    const exception = new InvalidCustomerLastNameException('   ');
    assertEquals(exception.message, "CustomerLastName has invalid value: '[Empty or Whitespace]'");
});

Deno.test('[Unit] - InvalidCustomerLastNameException - constructor - string with content - formats message correctly', () => {
    const exception = new InvalidCustomerLastNameException('InvalidValue');
    assertEquals(exception.message, "CustomerLastName has invalid value: 'InvalidValue'");
});

