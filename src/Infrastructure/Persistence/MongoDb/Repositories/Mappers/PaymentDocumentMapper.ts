import { CardNumber, CVV, ExpiryDate, Payment, PaymentAmount, PaymentId } from '@/Domain/Ticketing/Payments/mod.ts';
import { Document } from '@mongodb';
import { DocumentMapper } from '@/Infrastructure/Persistence/MongoDb/Shared/mod.ts';
import { BookingId, OrderId } from '@/Domain/Ticketing/Orders/mod.ts';
import { ExternalId } from '@/Domain/Shared/mod.ts';

interface paymentDocumentShape {
    _id?: string;
    id?: string;
    externalId: string;
    paymentMethod: string;
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    orderId: string;
    bookingId: string;
    amount: number;
    status: string;
}

export class PaymentDocumentMapper implements DocumentMapper<Payment> {
    toDocument(payment: Payment): Document {
        return {
            _id: payment.id.value,
            externalId: payment.externalId.value,
            paymentMethod: payment.paymentMethod,
            cardNumber: payment.cardNumber.value,
            expiryDate: payment.expiryDate.value,
            cvv: payment.cvv.value,
            orderId: payment.orderId.value,
            bookingId: payment.bookingId.value,
            amount: payment.amount.value,
            status: payment.status,
        };
    }

    reconstitute(document: Document): Payment {
        const paymentData = document as paymentDocumentShape;

        const payment = Object.create(Payment.prototype);
        payment['_id'] = PaymentId.create(paymentData._id ?? paymentData.id);
        payment['_externalId'] = ExternalId.create(paymentData.externalId);
        payment['_paymentMethod'] = paymentData.paymentMethod;
        payment['_cardNumber'] = CardNumber.create(paymentData.cardNumber);
        payment['_expiryDate'] = ExpiryDate.create(paymentData.expiryDate);
        payment['_cvv'] = CVV.create(paymentData.cvv);
        payment['_orderId'] = OrderId.create(paymentData.orderId);
        payment['_bookingId'] = BookingId.create(paymentData.bookingId);
        payment['_amount'] = PaymentAmount.create(paymentData.amount);
        payment['_status'] = paymentData.status;
        payment['_domainEvents'] = [];

        return payment as Payment;
    }
}
