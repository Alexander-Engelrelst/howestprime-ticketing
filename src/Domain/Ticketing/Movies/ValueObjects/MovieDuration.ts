import { ValueObject, DomainException } from '@/Domain/Shared/mod.ts';

export class InvalidMovieDurationException extends DomainException {
    constructor(value: number) {
        super(`MovieDuration has invalid value: '${String(value)}'`);
    }
}

export class MovieDuration extends ValueObject {
    private readonly _value: number;

    private constructor(value: number) {
        super();
        this._value = value;
    }   

    static create(value: number): MovieDuration {
        const instance = new MovieDuration(value);
        instance.validate();
        return instance;
    }

    protected validate(): void {
        if (!Number.isInteger(this._value) || this._value <= 0) {
            throw new InvalidMovieDurationException(this._value);
        }
    }

    override equals(other: MovieDuration): boolean {
        return other?._value === this._value;
    }

    get value(): number {
        return this._value;
    }
}