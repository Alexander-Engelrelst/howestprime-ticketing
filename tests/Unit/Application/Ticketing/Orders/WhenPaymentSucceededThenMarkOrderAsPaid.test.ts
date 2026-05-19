import { assertEquals, assertRejects } from '@std/assert';
import type { Logger, UseCase } from '@/Application/Ports/mod.ts';
import { WhenPaymentSucceededThenMarkOrderAsPaid } from '@/Application/Ticketing/Orders/WhenPaymentSucceededThenMarkOrderAsPaid.ts';
import type { MarkOrderAsPaidUseCaseInput } from '@/Application/Ticketing/Orders/mod.ts';
import { PaymentSucceededDomainEvent } from '@/Domain/Ticketing/Payments/mod.ts';

const mockLogger: Logger = {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
};

Deno.test('[Unit] - WhenPaymentSucceededThenMarkOrderAsPaid - handle - calls use case', async () => {
    const calls: string[] = [];
    const markOrderAsPaid = {
        execute: ({ orderId }: MarkOrderAsPaidUseCaseInput) => {
            calls.push(orderId);
            return Promise.resolve();
        },
    } as UseCase<MarkOrderAsPaidUseCaseInput, void>;
    const policy = new WhenPaymentSucceededThenMarkOrderAsPaid(
        mockLogger,
        markOrderAsPaid,
    );
    const event = PaymentSucceededDomainEvent.create(
        'payment-1',
        'order-123',
        'booking-123',
    );

    await policy.handle(event);

    assertEquals(calls.length, 1);
    assertEquals(calls[0], 'order-123');
});

Deno.test('[Unit] - WhenPaymentSucceededThenMarkOrderAsPaid - handle - propagates errors', async () => {
    const markOrderAsPaid = {
        execute: () => Promise.reject(new Error('boom')),
    } as UseCase<MarkOrderAsPaidUseCaseInput, void>;
    const policy = new WhenPaymentSucceededThenMarkOrderAsPaid(
        mockLogger,
        markOrderAsPaid,
    );
    const event = PaymentSucceededDomainEvent.create(
        'payment-2',
        'order-456',
        'booking-456',
    );

    await assertRejects(
        () => policy.handle(event),
        Error,
        'boom',
    );
});
