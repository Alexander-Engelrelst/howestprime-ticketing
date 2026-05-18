import { DomainException, ValueObject } from '@/Domain/Shared/mod.ts';

export class InvalidMoneyException extends DomainException {
    constructor(value: number) {
        super(`Money must be a non-negative safe integer representing cents, but got: '${String(value)}'`);
    }
}

export class Money extends ValueObject {
    private readonly _value: number;

    private constructor(value: number) {
        super();
        this._value = value;
    }

    /**
     * Creates a Money instance from a whole number of cents (e.g., 1500 for €15.00).
     */
    static create(valueInCents: number): Money {
        const instance = new Money(valueInCents);
        instance.validate();
        return instance;
    }

    private validate(): void {
        if (
            !Number.isSafeInteger(this._value) || this._value < 0
        ) {
            throw new InvalidMoneyException(this._value);
        }
    }

    override equals(other: Money): boolean {
        return other?._value === this._value;
    }

    /**
     * The total amount stored in cents.
     */
    get value(): number {
        return this._value;
    }
}
