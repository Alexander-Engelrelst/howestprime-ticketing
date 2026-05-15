import { DomainException, ValueObject } from '@/Domain/Shared/mod.ts';

export class InvalidAgeRatingException extends DomainException {
    constructor(value: number) {
        super(
            `AgeRating must be an integer between ${AgeRating.MIN_AGE_RATING} and ${AgeRating.MAX_AGE_RATING}, but got: '${
                String(value)
            }'`,
        );
    }
}

export class AgeRating extends ValueObject {
    public static readonly MIN_AGE_RATING = 0;
    public static readonly MAX_AGE_RATING = 18;

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

    private validate(): void {
        if (
            !Number.isSafeInteger(this._value) || this._value < AgeRating.MIN_AGE_RATING ||
            this._value > AgeRating.MAX_AGE_RATING
        ) {
            throw new InvalidAgeRatingException(this._value);
        }
    }

    override equals(other: ValueObject): boolean {
        return other instanceof AgeRating && other._value === this._value;
    }

    get value(): number {
        return this._value;
    }
}
