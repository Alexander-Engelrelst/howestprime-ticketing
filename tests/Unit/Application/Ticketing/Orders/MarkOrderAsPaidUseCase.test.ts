import { assert, assertEquals } from '@std/assert';
import { AgeRating, Genre, MovieDuration, MovieId, MovieTitle, PosterUrl } from '@/Domain/Ticketing/Movies/mod.ts';
import { Money } from '@/Domain/Shared/mod.ts';
import {
    BookingId,
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
import { createMockDomainEventBus, createMockUnitOfWork } from '@/tests/Unit/Application/Shared/mod.ts';
import type { Logger } from '@/Application/Ports/mod.ts';
import { MarkOrderAsPaidUseCase } from '@/Application/Ticketing/Orders/MarkOrderAsPaidUseCase.ts';

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
        Money.fromCents(1500),
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

Deno.test('[Unit] - MarkOrderAsPaidUseCase - execute - marks order as paid', async () => {
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
    const useCase = new MarkOrderAsPaidUseCase(unitOfWork, mockLogger);

    await useCase.execute({ orderId });

    assertEquals(testOrder.status, OrderStatus.Paid);
    assertEquals(unitOfWork.doCalled, true);
    assertEquals(unitOfWork.saveCalled, true);
    assertEquals(unitOfWork.saveCallCount, 1);
    assertEquals(eventBus.publishedEvents.length, 1);
    assert(eventBus.publishedEvents[0] instanceof OrderPaidDomainEvent);
});

Deno.test('[Unit] - MarkOrderAsPaidUseCase - execute - missing order does not persist', async () => {
    const unitOfWork = createMockUnitOfWork({
        repositories: new Map<string, any>([[Order.name, {
            byId: () => Promise.resolve({ isPresent: false }),
            save: (_order: Order) => Promise.resolve(),
        }]]),
    });
    const useCase = new MarkOrderAsPaidUseCase(unitOfWork, mockLogger);

    await useCase.execute({ orderId: '550e8400-e29b-41d4-a716-446655440099' });

    assertEquals(unitOfWork.doCalled, true);
    assertEquals(unitOfWork.saveCalled, false);
    assertEquals(unitOfWork.saveCallCount, 0);
});
