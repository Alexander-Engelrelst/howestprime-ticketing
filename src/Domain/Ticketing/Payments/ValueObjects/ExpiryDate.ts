import { DomainException, ValueObject } from '@/Domain/Shared/mod.ts';

export class InvalidExpiryDateException extends DomainException {
    constructor(reason: string) {
        super(`Expiry date has invalid value: '${reason}'`);
    }
}

export class ExpiryDate extends ValueObject {
    private static readonly VALIDATION_REGEX = /^(0[1-9]|1[0-2])\/([0-9]{2}|[0-9]{4})$/;

    private readonly _value: string;

    private constructor(value: string) {
        super();
        this._value = value;
    }

    static create(value: string): ExpiryDate {
        const normalized = value.trim();
        const instance = new ExpiryDate(normalized);
        instance.validate();
        return instance;
    }

    private validate(): void {
        if (!this._value || this._value.length === 0) {
            throw new InvalidExpiryDateException(
                'Expiry date is empty or contains only whitespace',
            );
        }

        if (!ExpiryDate.VALIDATION_REGEX.test(this._value)) {
            throw new InvalidExpiryDateException(
                'Expiry date must be in the format MM/YY or MM/YYYY',
            );
        }
    }

    override equals(other: ValueObject): boolean {
        return other instanceof ExpiryDate && other._value === this._value;
    }

    get value(): string {
        return this._value;
    }
}
