import { DomainException, ValueObject } from '@/Domain/Shared/mod.ts';

export class InvalidExternalIdException extends DomainException {
    constructor(value: string) {
        const displayValue = value.trim().length === 0 ? '[Empty or Whitespace]' : value;
        super(`ExternalId has invalid value: '${displayValue}'`);
    }
}

export class ExternalId extends ValueObject {
    private readonly _value: string;

    private constructor(value: string) {
        super();
        this._value = value;
    }

    static create(value: string): ExternalId {
        const normalized = value.trim();
        const instance = new ExternalId(normalized);
        instance.validate();
        return instance;
    }

    private validate(): void {
        if (!this._value || this._value.length === 0) {
            throw new InvalidExternalIdException(this._value);
        }
    }

    get value(): string {
        return this._value;
    }

    override equals(other: ValueObject): boolean {
        return other instanceof ExternalId && other._value === this._value;
    }
}