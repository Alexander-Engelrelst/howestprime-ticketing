import { DomainException, ValueObject } from '@/Domain/Shared/mod.ts';

export class InvalidCustomerLastNameException extends DomainException {
    constructor(reason: string) {
        super(`CustomerLastName has invalid value: '${reason}'`);
    }
}

export class CustomerLastName extends ValueObject {
    private readonly _value: string;

    private constructor(value: string) {
        super();
        this._value = value;
    }

    static create(value: string): CustomerLastName {
        const normalized = value.trim();
        const instance = new CustomerLastName(normalized);
        instance.validate();
        return instance;
    }

    private validate(): void {
        if (!this._value || this._value.length === 0) {
            throw new InvalidCustomerLastNameException('Last name is empty or contains only whitespace');
        }
    }

    override equals(other: ValueObject): boolean {
        return other instanceof CustomerLastName && other._value === this._value;
    }

    get value(): string {
        return this._value;
    }
}
