import { assertEquals } from '@std/assert';
import type { Logger, UseCase } from '@/Application/Ports/mod.ts';
import type { ReleaseTicketUseCaseInput } from '@/Application/Ticketing/Orders/mod.ts';
import { WhenOrderPaidThenReleaseTickets } from '@/Application/Ticketing/Orders/WhenOrderPaidThenReleaseTickets.ts';
import { OrderPaidDomainEvent } from '@/Domain/Ticketing/Orders/mod.ts';

const mockLogger: Logger = {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
};

Deno.test('[Unit] - WhenOrderPaidThenReleaseTickets - handle - calls release tickets use case', async () => {
    const calls: ReleaseTicketUseCaseInput[] = [];

    const releaseTicket = {
        execute: (input: ReleaseTicketUseCaseInput) => {
            calls.push(input);
            return Promise.resolve();
        },
    } as UseCase<ReleaseTicketUseCaseInput, void>;

    const policy = new WhenOrderPaidThenReleaseTickets(mockLogger, releaseTicket);
    const event = OrderPaidDomainEvent.create(
        '550e8400-e29b-41d4-a716-446655440000',
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    );

    await policy.handle(event);

    assertEquals(calls.length, 1);
    assertEquals(calls[0]?.orderId, '550e8400-e29b-41d4-a716-446655440000');
});