import { DomainException, ValueObject } from '@/Domain/Shared/mod.ts';

export enum VisitorType {
    Standard = "standard",
    Discounted = "discounted",
}

export class InvalidSeatNumberException extends DomainException {
    constructor(seatNumber: number) {
        super(`Seat number must be at least 1. Received: ${seatNumber}`);
    }
}

export class Seat extends ValueObject {
    private readonly _seatNumber: number;
    private readonly _visitorType: VisitorType;

    private constructor(seatNumber: number, visitorType: VisitorType) {
        super();
        this._seatNumber = seatNumber;
        this._visitorType = visitorType;
    }

    static create(seatNumber: number, visitorType: VisitorType): Seat {
        const instance = new Seat(seatNumber, visitorType);
        instance.validate();

        return instance;
    }

    override equals(other: ValueObject): boolean {
        return (
            other instanceof Seat &&
            other._seatNumber === this._seatNumber &&
            other._visitorType === this._visitorType
        );
    }

    private validate(): void {
        if (this._seatNumber <= 0) {
            throw new InvalidSeatNumberException(this._seatNumber);
        }
    }

    get seatNumber(): number {
        return this._seatNumber;
    }

    get visitorType(): VisitorType {
        return this._visitorType;
    }
}
