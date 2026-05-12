import { ValueObject, DomainException } from '@/Domain/Shared/mod.ts';

const MIN_AGE_RATING = 0;
const MAX_AGE_RATING = 18;

export class InvalidAgeRatingException extends DomainException {
    constructor(value: number) {
        super(`AgeRating must be an integer between ${MIN_AGE_RATING} and ${MAX_AGE_RATING}, but got: '${String(value)}'`);
    }
}

export class AgeRating extends ValueObject {
    private readonly _value: number;

    private constructor(value: number) {
        super();
        this._value = value;
    }   

    static create(value: number): AgeRating {
        const instance = new AgeRating(value);
        instance.validate();
        return instance;
    }

    protected validate(): void {
        if (!Number.isSafeInteger(this._value) || this._value < MIN_AGE_RATING || this._value > MAX_AGE_RATING) {
            throw new InvalidAgeRatingException(this._value);
        }
    }

    override equals(other: AgeRating): boolean {
        return other?._value === this._value;
    }

    get value(): number {
        return this._value;
    }
}