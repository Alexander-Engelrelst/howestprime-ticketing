import { WhenSuggestionCreatedConsoleLogSuggestion } from '@/Application/Ticketing/Suggestions/mod.ts';
import { SuggestionCreatedDomainEvent } from '@/Domain/Ticketing/Suggestions/mod.ts';

export const domainEventPolicies: Map<string, string[]> = new Map([
    [
        SuggestionCreatedDomainEvent.FQDN_VALUE.toString(),
        [WhenSuggestionCreatedConsoleLogSuggestion.name],
    ],
]);
