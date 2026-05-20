import { assert, assertEquals } from '@std/assert';
import type { Logger } from '@/Application/Ports/mod.ts';
import { ReleaseTicketUseCase } from '@/Application/Ticketing/Orders/ReleaseTicketUseCase.ts';
import { createMockDomainEventBus, createMockUnitOfWork } from '@/tests/Unit/Application/Shared/mod.ts';
import {
    BookingId,
    Customer,
    CustomerEmail,
    CustomerFirstName,
    CustomerLastName,
    CustomerSalutation,
    MovieInfo,
    Order,
    OrderId,
    OrderStatus,
    RoomName,
    ShowTime,
    TicketMappingService,
    TicketsReleasedDomainEvent,
    VisitorType,
} from '@/Domain/Ticketing/Orders/mod.ts';
import { AgeRating, Genre, MovieDuration, MovieId, MovieTitle, PosterUrl } from '@/Domain/Ticketing/Movies/mod.ts';
import { Money } from '@/Domain/Shared/mod.ts';

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
        ShowTime.create(new Date('2026-05-20T20:00:00Z')),
    );

    const order = Order.create(
        OrderId.create(id),
        BookingId.create(bookingId),
        tickets,
    );

    order.acceptTerms();
    order.assignCustomer(Customer.create(
        CustomerFirstName.create('Alex'),
        CustomerLastName.create('Engelrelst'),
        CustomerEmail.create('alex@example.com'),
        CustomerSalutation.create('Mr.'),
    ));
    order.confirmPayment();

    return order;
}

Deno.test('[Unit] - ReleaseTicketUseCase - execute - releases tickets and publishes TicketsReleasedDomainEvent', async () => {
    const orderId = '550e8400-e29b-41d4-a716-446655440000';
    const bookingId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
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

    const useCase = new ReleaseTicketUseCase(unitOfWork, mockLogger);

    await useCase.execute({ orderId });

    assertEquals(testOrder.status, OrderStatus.TicketReleased);
    assertEquals(unitOfWork.doCalled, true);
    assertEquals(unitOfWork.saveCalled, true);
    assertEquals(unitOfWork.saveCallCount, 1);

    assertEquals(eventBus.publishedEvents.length, 2);
    assert(eventBus.publishedEvents.some((event) => event instanceof TicketsReleasedDomainEvent));

    const ticketsReleasedEvent = eventBus.publishedEvents.find(
        (event): event is TicketsReleasedDomainEvent => event instanceof TicketsReleasedDomainEvent,
    );

    assert(ticketsReleasedEvent !== undefined);
    assertEquals(ticketsReleasedEvent?.orderId, orderId);
    assertEquals(ticketsReleasedEvent?.customer?.email, 'alex@example.com');
    assertEquals(ticketsReleasedEvent?.tickets.length, 2);
});

Deno.test('[Unit] - ReleaseTicketUseCase - execute - missing order does not persist or publish events', async () => {
    const orderId = '550e8400-e29b-41d4-a716-446655440099';

    const orderRepository = {
        byId: () => Promise.resolve({ isPresent: false }),
        save: (_order: Order) => Promise.resolve(),
    };

    const eventBus = createMockDomainEventBus();
    const unitOfWork = createMockUnitOfWork({
        eventBus,
        repositories: new Map<string, any>([[Order.name, orderRepository]]),
    });

    const useCase = new ReleaseTicketUseCase(unitOfWork, mockLogger);

    await useCase.execute({ orderId });

    assertEquals(unitOfWork.doCalled, true);
    assertEquals(unitOfWork.saveCalled, false);
    assertEquals(unitOfWork.saveCallCount, 0);
    assertEquals(eventBus.publishedEvents.length, 0);
});