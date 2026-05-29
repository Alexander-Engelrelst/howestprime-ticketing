import { DomainException, ValueObject } from '@/Domain/Shared/mod.ts';

export class InvalidMoneyException extends DomainException {
    constructor(value: number) {
        super(
            `Money must be a non-negative integer smaller than ${Money.MAX_CENTS}, representing cents, but got: '${
                String(value)
            }'`,
        );
    }
}

/**
 * @description Represents a monetary amount in cents (e.g., 1500 for €15.00). Must be a non-negative safe integer.
 */
export class Money extends ValueObject {
    public static readonly MAX_CENTS = 99_999_999; // based on the max allowed size of a stripe payment
    private readonly _value: number;

    private constructor(value: number) {
        super();
        this._value = value;
    }

    /**
     * @description Creates a Money instance from a whole number of cents (e.g., 1500 for €15.00).
     */
    static fromCents(valueInCents: number): Money {
        const instance = new Money(valueInCents);
        instance.validate();
        return instance;
    }

    private validate(): void {
        if (
            !Number.isInteger(this._value) || this._value < 0 || this._value > Money.MAX_CENTS
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
