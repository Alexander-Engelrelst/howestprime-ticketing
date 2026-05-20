import { WhenSuggestionCreatedConsoleLogSuggestion } from '@/Application/Ticketing/Suggestions/mod.ts';
import { WhenPaymentSucceededThenMarkOrderAsPaid } from '@/Application/Ticketing/Orders/WhenPaymentSucceededThenMarkOrderAsPaid.ts';
import { WhenPaymentFailedThenCancelOrder } from '@/Application/Ticketing/Orders/WhenPaymentFailedThenCancelOrder.ts';
import { WhenOrderPaidThenReleaseTickets } from '@/Application/Ticketing/Orders/WhenOrderPaidThenReleaseTickets.ts';
import { SuggestionCreatedDomainEvent } from '@/Domain/Ticketing/Suggestions/mod.ts';
import {
    PaymentFailedDomainEvent,
    PaymentSucceededDomainEvent,
} from '@/Domain/Ticketing/Payments/mod.ts';
import { OrderPaidDomainEvent } from '@/Domain/Ticketing/Orders/mod.ts';

export const domainEventPolicies: Map<string, string[]> = new Map([
    [
        SuggestionCreatedDomainEvent.FQDN_VALUE.toString(),
        [WhenSuggestionCreatedConsoleLogSuggestion.name],
    ],
    [
        PaymentSucceededDomainEvent.FQDN_VALUE.toString(),
        [WhenPaymentSucceededThenMarkOrderAsPaid.name],
    ],
    [
        PaymentFailedDomainEvent.FQDN_VALUE.toString(),
        [WhenPaymentFailedThenCancelOrder.name],
    ],
    [
        OrderPaidDomainEvent.FQDN_VALUE.toString(),
        [WhenOrderPaidThenReleaseTickets.name],
    ],
]);
