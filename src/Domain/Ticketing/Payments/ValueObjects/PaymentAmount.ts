import { DomainException } from '@/Domain/Shared/mod.ts';

export class InvalidPaymentAmountException extends DomainException {
    constructor(value: number) {
        super(`Payment amount must be a positive safe integer representing cents, but got: '${String(value)}'`);
    }
}

/**
 * Represents a payment amount in cents (e.g., 1500 for €15.00). Must be a positive safe integer.
 */
export class PaymentAmount {
    private readonly _value: number;

    private constructor(value: number) {
        this._value = value;
    }

    /**
     * Creates a PaymentAmount instance from a whole number of cents (e.g., 1500 for €15.00).
     */
    static create(value: number): PaymentAmount {
        const instance = new PaymentAmount(value);
        instance.validate();
        return instance;
    }

    private validate(): void {
        if (!Number.isSafeInteger(this._value) || this._value <= 0) {
            throw new InvalidPaymentAmountException(this._value);
        }
    }

    equals(other: object): boolean {
        return other instanceof PaymentAmount && other._value === this._value;
    }

    /**
     * Gets the value of the payment amount in cents.
     */
    get value(): number {
        return this._value;
    }
}