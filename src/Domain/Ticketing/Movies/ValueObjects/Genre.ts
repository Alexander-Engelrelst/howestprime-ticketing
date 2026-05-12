import { ValueObject, DomainException } from '@/Domain/Shared/mod.ts';

export class InvalidGenreException extends DomainException {
    constructor(value: string) {
        super(`Genre has invalid value: '${String(value)}'`);
    }
}

export class Genre extends ValueObject {
    private readonly _value: string;

    private constructor(value: string) {
        super();
        this._value = value;
    }   

    static create(value: string): Genre {
        const normalized = value.trim();
        const instance = new Genre(normalized);
        instance.validate();
        return instance;
    }

    protected validate(): void {
        if (!this._value || this._value.length === 0) {
            throw new InvalidGenreException(this._value);
        }
    }

    override equals(other: Genre): boolean {
        return other?._value === this._value;
    }

    get value(): string {
        return this._value;
    }
}