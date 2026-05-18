import { DomainException, ValueObject } from '@/Domain/Shared/mod.ts';

export class InvalidCCVException extends DomainException {
    constructor(reason: string) {
        super(`CCV has invalid value: '${reason}'`);
    }
}

export class CCV extends ValueObject {
    private static readonly VALIDATION_REGEX = /^\d{3,4}$/;

    private readonly _value: string;

    private constructor(value: string) {
        super();
        this._value = value;
    }

    static create(value: string): CCV {
        const normalized = value.trim();
        const instance = new CCV(normalized);
        instance.validate();
        return instance;
    }

    private validate(): void {
        if (!this._value || this._value.length === 0) {
            throw new InvalidCCVException('received empty or contains only whitespace');
        }

        if (!CCV.VALIDATION_REGEX.test(this._value)) {
            throw new InvalidCCVException('must be 3 or 4 digits');
        }
    }

    override equals(other: ValueObject): boolean {
        return other instanceof CCV && other._value === this._value;
    }
}