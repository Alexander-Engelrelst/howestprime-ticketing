import { assertEquals, assertRejects } from '@std/assert';
import type { Logger, UseCase } from '@/Application/Ports/mod.ts';
import { WhenPaymentFailedThenCancelOrder } from '@/Application/Ticketing/Orders/WhenPaymentFailedThenCancelOrder.ts';
import type { CancelOrderUseCaseInput } from '@/Application/Ticketing/Orders/mod.ts';
import { PaymentFailedDomainEvent } from '@/Domain/Ticketing/Payments/mod.ts';

const mockLogger: Logger = {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
};

Deno.test('[Unit] - WhenPaymentFailedThenCancelOrder - handle - calls use case', async () => {
    const calls: string[] = [];
    const cancelOrder = {
        execute: ({ orderId }: CancelOrderUseCaseInput) => {
            calls.push(orderId);
            return Promise.resolve();
        },
    } as UseCase<CancelOrderUseCaseInput, void>;
    const policy = new WhenPaymentFailedThenCancelOrder(
        mockLogger,
        cancelOrder,
    );
    const event = PaymentFailedDomainEvent.create(
        'payment-1',
        'order-123',
        'booking-123',
        'Insufficient funds',
    );

    await policy.handle(event);

    assertEquals(calls.length, 1);
    assertEquals(calls[0], 'order-123');
});

Deno.test('[Unit] - WhenPaymentFailedThenCancelOrder - handle - propagates errors', async () => {
    const cancelOrder = {
        execute: () => Promise.reject(new Error('boom')),
    } as UseCase<CancelOrderUseCaseInput, void>;
    const policy = new WhenPaymentFailedThenCancelOrder(
        mockLogger,
        cancelOrder,
    );
    const event = PaymentFailedDomainEvent.create(
        'payment-2',
        'order-456',
        'booking-456',
        'Card declined',
    );

    await assertRejects(
        () => policy.handle(event),
        Error,
        'boom',
    );
});