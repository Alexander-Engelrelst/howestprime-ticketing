import { assertEquals, assertInstanceOf, assertThrows } from '@std/assert';
import { DomainException, ExternalId, InvalidExternalIdException } from '@/Domain/Shared/mod.ts';

Deno.test('[Unit] - ExternalId - create - valid value with whitespace - returns trimmed value object', () => {
    const externalId = ExternalId.create('  ext-123  ');

    assertEquals(externalId.value, 'ext-123');
});

Deno.test('[Unit] - ExternalId - create - empty value - throws InvalidExternalIdException', () => {
    assertThrows(
        () => ExternalId.create(''),
        InvalidExternalIdException,
        "ExternalId has invalid value: '[Empty or Whitespace]'",
    );
});

Deno.test('[Unit] - ExternalId - create - whitespace only - throws InvalidExternalIdException', () => {
    assertThrows(
        () => ExternalId.create('   '),
        InvalidExternalIdException,
        "ExternalId has invalid value: '[Empty or Whitespace]'",
    );
});

Deno.test('[Unit] - ExternalId - equals - same value - returns true', () => {
    const left = ExternalId.create('ext-123');
    const right = ExternalId.create('ext-123');

    assertEquals(left.equals(right), true);
});

Deno.test('[Unit] - ExternalId - equals - different value - returns false', () => {
    const left = ExternalId.create('ext-123');
    const right = ExternalId.create('ext-456');

    assertEquals(left.equals(right), false);
});

Deno.test('[Unit] - InvalidExternalIdException - constructor - produces DomainException with normalized empty marker', () => {
    const error = new InvalidExternalIdException('   ');

    assertInstanceOf(error, DomainException);
    assertEquals(error.message, "ExternalId has invalid value: '[Empty or Whitespace]'");
});

Deno.test('[Unit] - InvalidExternalIdException - constructor - preserves non-empty value', () => {
    const error = new InvalidExternalIdException('ext-123');

    assertInstanceOf(error, DomainException);
    assertEquals(error.message, "ExternalId has invalid value: 'ext-123'");
});
