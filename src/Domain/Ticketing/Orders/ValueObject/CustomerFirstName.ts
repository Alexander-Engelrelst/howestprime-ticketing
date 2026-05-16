import { DomainException, ValueObject } from '@/Domain/Shared/mod.ts';

export class InvalidCustomerFirstNameException extends DomainException {
    constructor(value: string) {
        const displayValue = value.trim().length === 0 ? '[Empty or Whitespace]' : value;

        super(`CustomerFirstName has invalid value: '${displayValue}'`);
    }
}

export class CustomerFirstName extends ValueObject {
    private readonly _value: string;

    private constructor(value: string) {
        super();
        this._value = value;
    }

    static create(value: string): CustomerFirstName {
        const normalized = value.trim();
        const instance = new CustomerFirstName(normalized);
        instance.validate();
        return instance;
    }

    private validate(): void {
        if (!this._value || this._value.length === 0) {
            throw new InvalidCustomerFirstNameException(this._value);
        }
    }

    override equals(other: ValueObject): boolean {
        return other instanceof CustomerFirstName && other._value === this._value;
    }

    get value(): string {
        return this._value;
    }
}
