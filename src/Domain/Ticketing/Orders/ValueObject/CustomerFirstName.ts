import { DomainException, ValueObject } from '@/Domain/Shared/mod.ts';

export class InvalidCustomerFirstNameException extends DomainException {
    constructor(reason: string) {
        super(`CustomerFirstName has invalid value: '${reason}'`);
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
            throw new InvalidCustomerFirstNameException(
                'First name is empty or contains only whitespace',
            );
        }
    }

    override equals(other: ValueObject): boolean {
        return other instanceof CustomerFirstName && other._value === this._value;
    }

    get value(): string {
        return this._value;
    }
}
