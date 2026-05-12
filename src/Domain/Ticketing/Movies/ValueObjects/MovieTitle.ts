import { ValueObject, DomainException } from '@/Domain/Shared/mod.ts';

export class InvalidMovieTitleException extends DomainException {
    constructor(value: string) {
        super(`MovieTitle has invalid value: '${String(value)}'`);
    }
}

export class MovieTitle extends ValueObject {
    private readonly _value: string;

    private constructor(value: string) {
        super();
        this._value = value;
    }   

    static create(value: string): MovieTitle {
        // TODO(alex): ask what to do with this because using ?? will cause incorrect error messages
        if (value === null || value === undefined) {
            throw new InvalidMovieTitleException("[Missing Value]");
        }

        value = value.trim();
        const normalized = value.trim();
        const instance = new MovieTitle(normalized);
        instance.validate();
        return instance;
    }

    protected validate(): void {
        if (!this._value || this._value.length === 0) {
            throw new InvalidMovieTitleException("[Empty or Whitespace]");
        }
    }

    override equals(other: MovieTitle): boolean {
        return other?._value === this._value;
    }

    get value(): string {
        return this._value;
    }
}