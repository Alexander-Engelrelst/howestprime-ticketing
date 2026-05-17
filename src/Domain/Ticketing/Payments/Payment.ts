import { Entity, UUIDEntityId } from '@/Domain/Shared/mod.ts';

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

export class Ticket extends Entity<PaymentId> {
    private constructor(
        id: PaymentId,
    ) {
        super(id);
    }

    static create(
        paymentId: PaymentId,
    ): Ticket {
        return new Ticket(paymentId);
    }
}
