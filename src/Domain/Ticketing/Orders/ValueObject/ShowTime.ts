import { ValueObject } from '@/Domain/Shared/mod.ts';

export class ShowTime extends ValueObject {
    private readonly _value: Date;

    private constructor(value: Date) {
        super();
        this._value = value;
    }

    static create(value: Date): ShowTime {
        const instance = new ShowTime(value);
        return instance;
    }

    override equals(other: ValueObject): boolean {
        return other instanceof ShowTime && other._value.getTime() === this._value.getTime();
    }

    get value(): Date {
        return this._value;
    }
}
