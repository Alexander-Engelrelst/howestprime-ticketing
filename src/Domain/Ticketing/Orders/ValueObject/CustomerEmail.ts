import { DomainException, ValueObject } from '@/Domain/Shared/mod.ts';

export class InvalidCustomerEmailException extends DomainException {
    constructor(reason: string) {
        super(`CustomerEmail has invalid value: '${reason}'`);
    }
}

export class CustomerEmail extends ValueObject {
    private static readonly emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

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
            throw new InvalidCustomerEmailException('Email is empty or contains only whitespace');
        }

        if (!CustomerEmail.emailRegex.test(this._value)) {
            throw new InvalidCustomerEmailException('Email has invalid format');
        }
    }

    override equals(other: ValueObject): boolean {
        return other instanceof CustomerEmail && other._value === this._value;
    }

    get value(): string {
        return this._value;
    }
}
