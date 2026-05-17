import { DomainException, ValueObject } from '@/Domain/Shared/mod.ts';

export class InvalidCardNumberException extends DomainException {
    constructor(reason: string) {
        super(`CardNumber has invalid value: '${reason}'`);
    }
}

export class CardNumber extends ValueObject {
    static MIN_LENGTH = 13;
    static MAX_LENGTH = 19;
    static VALIDATION_REGEX = /^\d+$/;

    private readonly _value: string;

    private constructor(value: string) {
        super();
        this._value = value;
    }

    static create(value: string): CardNumber {
        const normalized = value.trim();
        const instance = new CardNumber(normalized);
        instance.validate();
        return instance;
    }

    private validate(): void {
        if (!this._value || this._value.length === 0) {
            throw new InvalidCardNumberException('Card number is empty or contains only whitespace');
        }

        if (this._value.length < CardNumber.MIN_LENGTH || this._value.length > CardNumber.MAX_LENGTH) {
            throw new InvalidCardNumberException(`Card number must be between ${CardNumber.MIN_LENGTH} and ${CardNumber.MAX_LENGTH} characters long`);
        }

        if (!CardNumber.VALIDATION_REGEX.test(this._value)) {
            throw new InvalidCardNumberException('Card number contains invalid characters (only digits are allowed)');
        }
    }

    override equals(other: ValueObject): boolean {
        return other instanceof CardNumber && other._value === this._value;
    }

    get value(): string {
        return this._value;
    }
}