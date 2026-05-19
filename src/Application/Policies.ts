import { WhenSuggestionCreatedConsoleLogSuggestion } from '@/Application/Ticketing/Suggestions/mod.ts';
import { WhenPaymentSucceededThenMarkOrderAsPaid } from '@/Application/Ticketing/Orders/WhenPaymentSucceededThenMarkOrderAsPaid.ts';
import { SuggestionCreatedDomainEvent } from '@/Domain/Ticketing/Suggestions/mod.ts';
import { PaymentSucceededDomainEvent } from '@/Domain/Ticketing/Payments/mod.ts';

export const domainEventPolicies: Map<string, string[]> = new Map([
    [
        SuggestionCreatedDomainEvent.FQDN_VALUE.toString(),
        [WhenSuggestionCreatedConsoleLogSuggestion.name],
    ],
    [
        PaymentSucceededDomainEvent.FQDN_VALUE.toString(),
        [WhenPaymentSucceededThenMarkOrderAsPaid.name],
    ],
]);
