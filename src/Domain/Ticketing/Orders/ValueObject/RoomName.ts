import { ValueObject } from '@/Domain/Shared/mod.ts';
import { IllegalArgumentException } from '@domaincrafters/std';

export class RoomName extends ValueObject {
    private readonly _value: string;

    private constructor(value: string) {
        super();
        this._value = value;
    }

    static create(value: string): RoomName {
        const normalized = value.trim();
        const instance = new RoomName(normalized);

        instance.validate();

        return instance;
    }

    override equals(other: ValueObject): boolean {
        return other instanceof RoomName && other._value === this._value;
    }

    get value(): string {
        return this._value;
    }

    private validate(): void {
        if (this._value.length === 0) {
            throw new IllegalArgumentException('Room name cannot be empty');
        }   
    }
}

