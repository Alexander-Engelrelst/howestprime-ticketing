import { DomainException, ValueObject } from '@/Domain/Shared/mod.ts';

export class InvalidCVVException extends DomainException {
    constructor(reason: string) {
        super(`CVV has invalid value: '${reason}'`);
    }
}

export class CVV extends ValueObject {
    private static readonly VALIDATION_REGEX = /^\d{3,4}$/;

    private readonly _value: string;

    private constructor(value: string) {
        super();
        this._value = value;
    }

    static create(value: string): CVV {
        const normalized = value.trim();
        const instance = new CVV(normalized);
        instance.validate();
        return instance;
    }

    private validate(): void {
        if (!this._value || this._value.length === 0) {
            throw new InvalidCVVException('received empty or contains only whitespace');
        }

        if (!CVV.VALIDATION_REGEX.test(this._value)) {
            throw new InvalidCVVException('must be 3 or 4 digits');
        }
    }

    override equals(other: ValueObject): boolean {
        return other instanceof CVV && other._value === this._value;
    }

    get value(): string {
        return this._value;
    }
}