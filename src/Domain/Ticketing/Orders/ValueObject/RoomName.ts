import { ValueObject } from '@/Domain/Shared/mod.ts';

export class RoomName extends ValueObject {
    private readonly _value: string;

    private constructor(value: string) {
        super();
        this._value = value;
    }

    static create(value: string): RoomName {
        const normalized = value.trim();
        const instance = new RoomName(normalized);
        return instance;
    }

    override equals(other: ValueObject): boolean {
        return other instanceof RoomName && other._value === this._value;
    }

    get value(): string {
        return this._value;
    }
}

