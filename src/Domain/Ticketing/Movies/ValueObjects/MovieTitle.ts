import { ValueObject, DomainException } from '@/Domain/Shared/mod.ts';

export class InvalidMovieTitleException extends DomainException {
    constructor(value: string) {
        const displayValue = value.length === 0 ? "[Emtpy or Whitespace]" : value;

        super(`SuggestionDescription has invalid value: '${String(displayValue)}'`);
    }
}

export class MovieTitle extends ValueObject {
    private readonly _value: string;

    private constructor(value: string) {
        super();
        this._value = value;
    }   

    static create(value: string): MovieTitle {
        const normalized = value.trim();
        const instance = new MovieTitle(normalized);
        instance.validate();
        return instance;
    }

    protected validate(): void {
        if (!this._value || this._value.length === 0) {
            throw new InvalidMovieTitleException(this._value);
        }
    }

    override equals(other: MovieTitle): boolean {
        return other?._value === this._value;
    }

    get value(): string {
        return this._value;
    }
}