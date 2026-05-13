import { DomainException, ValueObject } from '@/Domain/Shared/mod.ts';

export class InvalidCustomerEmailException extends DomainException {
    constructor(value: string) {
        const displayValue = value.trim().length === 0 ? '[Empty or Whitespace]' : value;
        super(`CustomerEmail has invalid value: '${displayValue}'`);
    }
}

export class CustomerEmail extends ValueObject {
    private static readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    private readonly _value: string;

    private constructor(value: string) {
        super();
        this._value = value;
    }

    static create(value: string): CustomerEmail {
        const normalized = value.trim();
        const instance = new CustomerEmail(normalized);
        instance.validate();
        return instance;
    }

    private validate(): void {
        if (!this._value || this._value.length === 0) {
            throw new InvalidCustomerEmailException(this._value);
        }
        // Simple email format validation

        if (!CustomerEmail.emailRegex.test(this._value)) {
            throw new InvalidCustomerEmailException(this._value);
        }
    }

    override equals(other: ValueObject): boolean {
        return other instanceof CustomerEmail && other._value === this._value;
    }

    get value(): string {
        return this._value;
    }
}