import { assert, assertEquals, assertRejects } from '@std/assert';
import type { Logger } from '@/Application/Ports/mod.ts';
import { WhenPaymentSucceededThenMarkOrderAsPaid } from '@/Application/Ticketing/Orders/WhenPaymentSucceededThenMarkOrderAsPaid.ts';
import { createMockDomainEventBus, createMockUnitOfWork } from '@/tests/Unit/Application/Shared/mod.ts';
import {
    BookingId,
    CustomerMustAgreeToTermsException,
    MovieInfo,
    Order,
    OrderId,
    OrderPaidDomainEvent,
    OrderStatus,
    RoomName,
    ShowTime,
    TicketMappingService,
    VisitorType,
} from '@/Domain/Ticketing/Orders/mod.ts';
import { PaymentSucceededDomainEvent } from '@/Domain/Ticketing/Payments/mod.ts';
import { Money } from '@/Domain/Shared/mod.ts';
import { AgeRating, Genre, MovieDuration, MovieId, MovieTitle, PosterUrl } from '@/Domain/Ticketing/Movies/mod.ts';

const mockLogger: Logger = {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
};

function createTestOrder(id: string, bookingId: string): Order {
    const movieInfo = MovieInfo.create(
        MovieId.create('123e4567-e89b-12d3-a456-426614174000'),
        MovieTitle.create('Inception'),
        MovieDuration.create(148),
        [Genre.create('Action')],
        AgeRating.create(12),
        PosterUrl.create('https://example.com/poster.jpg'),
        Money.create(1500),
    );

    const tickets = TicketMappingService.mapToTickets(
        [10, 11],
        [{ type: VisitorType.Standard, quantity: 2 }],
        movieInfo,
        RoomName.create('Screen 1'),
        ShowTime.create(new Date()),
    );

    return Order.create(
        OrderId.create(id),
        BookingId.create(bookingId),
        tickets,
    );
}

Deno.test('[Unit] - WhenPaymentSucceededThenMarkOrderAsPaid - handle - valid event - marks order as paid and publishes OrderPaidDomainEvent', async () => {
    const orderId = '550e8400-e29b-41d4-a716-446655440000';
    const bookingId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    const testOrder = createTestOrder(orderId, bookingId);
    testOrder.acceptTerms();

    const orderRepository = {
        byId: () => Promise.resolve({ isPresent: true, value: testOrder }),
        save: (_order: Order) => Promise.resolve(),
    };

    const eventBus = createMockDomainEventBus();
    const unitOfWork = createMockUnitOfWork({
        eventBus,
        repositories: new Map<string, any>([[Order.name, orderRepository]]),
    });

    const policy = new WhenPaymentSucceededThenMarkOrderAsPaid(unitOfWork, mockLogger);
    const event = PaymentSucceededDomainEvent.create('payment-1', orderId, bookingId);

    await policy.handle(event);

    assertEquals(testOrder.status, OrderStatus.Paid);
    assertEquals(unitOfWork.doCalled, true);
    assertEquals(unitOfWork.saveCalled, true);
    assertEquals(unitOfWork.saveCallCount, 1);

    assertEquals(eventBus.publishedEvents.length, 1);
    const publishedEvent = eventBus.publishedEvents[0];
    assert(publishedEvent instanceof OrderPaidDomainEvent);
    assertEquals(publishedEvent.orderId, orderId);
    assertEquals(publishedEvent.bookingId, bookingId);
});

Deno.test('[Unit] - WhenPaymentSucceededThenMarkOrderAsPaid - handle - invalid order state - propagates domain invariant exception and does not persist', async () => {
    const orderId = '550e8400-e29b-41d4-a716-446655440001';
    const bookingId = 'f47ac10b-58cc-4372-a567-0e02b2c3d480';
    const testOrder = createTestOrder(orderId, bookingId);

    const orderRepository = {
        byId: () => Promise.resolve({ isPresent: true, value: testOrder }),
        save: (_order: Order) => Promise.resolve(),
    };

    const eventBus = createMockDomainEventBus();
    const unitOfWork = createMockUnitOfWork({
        eventBus,
        repositories: new Map<string, any>([[Order.name, orderRepository]]),
    });

    const policy = new WhenPaymentSucceededThenMarkOrderAsPaid(unitOfWork, mockLogger);
    const event = PaymentSucceededDomainEvent.create('payment-2', orderId, bookingId);

    await assertRejects(
        () => policy.handle(event),
        CustomerMustAgreeToTermsException,
    );

    assertEquals(testOrder.status, OrderStatus.Open);
    assertEquals(unitOfWork.saveCalled, false);
    assertEquals(eventBus.publishedEvents.length, 0);
});

Deno.test('[Unit] - WhenPaymentSucceededThenMarkOrderAsPaid - handle - order does not exist - does not persist and does not publish OrderPaidDomainEvent', async () => {
    const missingOrderId = '550e8400-e29b-41d4-a716-446655440099';
    const bookingId = 'f47ac10b-58cc-4372-a567-0e02b2c3d499';

    const orderRepository = {
        byId: () => Promise.resolve({ isPresent: false }),
        save: (_order: Order) => Promise.resolve(),
    };

    const eventBus = createMockDomainEventBus();
    const unitOfWork = createMockUnitOfWork({
        eventBus,
        repositories: new Map<string, any>([[Order.name, orderRepository]]),
    });

    const policy = new WhenPaymentSucceededThenMarkOrderAsPaid(unitOfWork, mockLogger);
    const event = PaymentSucceededDomainEvent.create('payment-3', missingOrderId, bookingId);

    await policy.handle(event);

    assertEquals(unitOfWork.doCalled, true);
    assertEquals(unitOfWork.saveCalled, false);
    assertEquals(unitOfWork.saveCallCount, 0);
    assertEquals(eventBus.publishedEvents.length, 0);
});
