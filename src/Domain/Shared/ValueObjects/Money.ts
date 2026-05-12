import { ValueObject, DomainException } from '@/Domain/Shared/mod.ts';

export class InvalidMoneyException extends DomainException {
    constructor(value: number) {
        super(`Money must be a positive number, but got: '${String(value)}'`);
    }
}

export class Money extends ValueObject {
    private readonly _value: number;

    private constructor(value: number) {
        super();
        this._value = value;
    }   

    static create(value: number): Money {
        const instance = new Money(value);
        instance.validate();
        return instance;
    }

    protected validate(): void {
        // TODO(alex): what about NaN and Infinity? What should we trust?

        if (this._value < 0) {
            throw new InvalidMoneyException(this._value);
        }
    }

    override equals(other: Money): boolean {
        return other?._value === this._value;
    }

    get value(): number {
        return this._value;
    }
}