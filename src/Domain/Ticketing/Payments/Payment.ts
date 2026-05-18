import { AggregateRoot, UUIDEntityId } from '@/Domain/Shared/mod.ts';
import { ExternalId } from '@/Domain/Shared/ValueObjects/ExternalId.ts';
import { CardNumber, CCV, ExpiryDate, InvalidPaymentStatusTransitionException, PaymentAmount } from '@/Domain/Ticketing/Payments/mod.ts';
import { BookingId, OrderId } from '@/Domain/Ticketing/Orders/mod.ts';

export enum PaymentStatus {
    Pending = "Pending",
    Success = "Success",
    Failed = "Failed",
}

export enum PaymentMethod {
    CreditCard = "CreditCard",
    BankTransfer = "BankTransfer",
}

export class PaymentId extends UUIDEntityId {
    static create(value?: string): PaymentId {
        return new PaymentId(value);
    }

    private constructor(value?: string) {
        super(value);
    }
}

export class Payment extends AggregateRoot<PaymentId> {
    private readonly _externalId: ExternalId;
    private readonly _paymentMethod: PaymentMethod;
    private readonly _cardNumber: CardNumber;
    private readonly _expiryDate: ExpiryDate;
    private readonly _ccv: CCV;
    private readonly _orderId: OrderId;
    private readonly _bookingId: BookingId;
    private readonly _amount: PaymentAmount;
    private _status: PaymentStatus;

    private constructor(
        id: PaymentId,
        externalId: ExternalId,
        paymentMethod: PaymentMethod,
        cardNumber: CardNumber,
        expiryDate: ExpiryDate,
        ccv: CCV,
        orderId: OrderId,
        bookingId: BookingId,
        amount: PaymentAmount,
        status: PaymentStatus
    ) {
        super(id);
        this._externalId = externalId;
        this._paymentMethod = paymentMethod;
        this._cardNumber = cardNumber;
        this._expiryDate = expiryDate;
        this._ccv = ccv;
        this._orderId = orderId;
        this._bookingId = bookingId;
        this._amount = amount;
        this._status = status;
    }

    static create(
        paymentId: PaymentId,
        externalId: ExternalId,
        paymentMethod: PaymentMethod,
        cardNumber: CardNumber,
        expiryDate: ExpiryDate,
        ccv: CCV,
        orderId: OrderId,
        bookingId: BookingId,
        amount: PaymentAmount,
    ): Payment {
        return new Payment(
            paymentId,
            externalId,
            paymentMethod,
            cardNumber,
            expiryDate,
            ccv,
            orderId,
            bookingId,
            amount,
            PaymentStatus.Pending
        );
    }

    get externalId(): ExternalId {
        return this._externalId;
    }

    get paymentMethod(): PaymentMethod {
        return this._paymentMethod;
    }

    get cardNumber(): CardNumber {
        return this._cardNumber;
    }

    get expiryDate(): ExpiryDate {
        return this._expiryDate;
    }

    get ccv(): CCV {
        return this._ccv;
    }

    get orderId(): OrderId {
        return this._orderId;
    }

    get bookingId(): BookingId {
        return this._bookingId;
    }

    get amount(): PaymentAmount {
        return this._amount;
    }

    get status(): PaymentStatus {
        return this._status;
    }

    markAsSuccess(): void {
        if (this._status !== PaymentStatus.Pending) {
            throw new InvalidPaymentStatusTransitionException(this._status, PaymentStatus.Success);
        }
        this._status = PaymentStatus.Success;
    }

    markAsFailed(): void {
        if (this._status !== PaymentStatus.Pending) {
            throw new InvalidPaymentStatusTransitionException(this._status, PaymentStatus.Failed);
        }
        this._status = PaymentStatus.Failed;
    }
}
