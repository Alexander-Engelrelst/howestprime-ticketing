import { DomainException, ValueObject } from '@/Domain/Shared/mod.ts';

export class InvalidExternalIdException extends DomainException {
    constructor(value: string) {
        super(`Invalid ExternalId: '${value}' is not a valid UUID format.`);
    }
}
export class ExternalId extends ValueObject {
    // The standard UUID pattern: 8-4-4-4-12 hex characters
    // The [0-9a-f] part covers hex, and 'i' makes it case-insensitive
    private static readonly UUID_REGEX: RegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    private readonly _value: string;

    private constructor(value: string) {
        super();
        this._value = value;
    }

    public static create(value: string): ExternalId {
        if (!ExternalId.UUID_REGEX.test(value)) {
            throw new InvalidExternalIdException(value);
        }
        return new ExternalId(value);
    }

    public get value(): string {
        return this._value;
    }

    override equals(other: ExternalId): boolean {
        return other._value === this._value;
    }
}