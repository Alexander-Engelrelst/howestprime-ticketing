import { assert, assertEquals, assertRejects } from '@std/assert';
import type { Logger } from '@/Application/Ports/mod.ts';
import type { PaymentRequest, PaymentResponse, PaymentService } from '@/Application/Ports/Gateways/mod.ts';
import { PayOrderUseCase, type PayOrderUseCaseInput } from '@/Application/Ticketing/Payments/mod.ts';
import { createMockDomainEventBus, createMockUnitOfWork } from '@/tests/Unit/Application/Shared/mod.ts';
import {
    BookingId,
    MovieInfo,
    Order,
    OrderId,
    RoomName,
    ShowTime,
    TicketMappingService,
    VisitorType,
} from '@/Domain/Ticketing/Orders/mod.ts';
import {
    Payment,
    PaymentFailedDomainEvent,
    PaymentMethod,
    PaymentStatus,
    PaymentSucceededDomainEvent,
} from '@/Domain/Ticketing/Payments/mod.ts';
import { Money } from '@/Domain/Shared/mod.ts';
import { AgeRating, Genre, MovieDuration, MovieId, MovieTitle, PosterUrl } from '@/Domain/Ticketing/Movies/mod.ts';
import { DomainException } from '@domaincrafters/std';

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

function createValidInput(orderId: string, bookingId: string): PayOrderUseCaseInput {
    return {
        orderId,
        externalId: 'ext-payment-001',
        paymentMethod: PaymentMethod.CreditCard,
        cardNumber: '4111111111111111',
        expiryDate: '12/30',
        cvv: '123',
        amount: 1500,
        bookingId,
    };
}

function createPaymentServiceMock(response: PaymentResponse): PaymentService & {
    payCallCount: number;
    requests: PaymentRequest[];
} {
    const mock = {
        payCallCount: 0,
        requests: [] as PaymentRequest[],
        pay: async (request: PaymentRequest): Promise<PaymentResponse> => {
            mock.requests.push(request);
            mock.payCallCount++;
            return response;
        },
    };

    return mock;
}

Deno.test('[Unit] - PayOrderUseCase - execute - payment provider success - marks success and publishes PaymentSucceededDomainEvent', async () => {
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

    const paymentService = createPaymentServiceMock({ success: true });
    const useCase = new PayOrderUseCase(unitOfWork, mockLogger, paymentService);

    const result = await useCase.execute(createValidInput(orderId, bookingId));

    assertEquals(typeof result, 'string');
    assertEquals(paymentService.payCallCount, 1);
    assertEquals(paymentService.requests.length, 1);
    assertEquals(paymentService.requests[0]?.amount, 1500);
    assertEquals(paymentService.requests[0]?.paymentMethod, PaymentMethod.CreditCard);

    assertEquals(unitOfWork.saveCallCount, 2);
    const lastSaved = unitOfWork.savedEntities[unitOfWork.savedEntities.length - 1] as Payment;
    assertEquals(lastSaved.status, PaymentStatus.Success);

    assertEquals(eventBus.publishedEvents.length, 1);
    const event = eventBus.publishedEvents[0];
    assert(event instanceof PaymentSucceededDomainEvent);
    assertEquals(event.paymentId, result);
    assertEquals(event.orderId, orderId);
    assertEquals(event.bookingId, bookingId);
});

Deno.test('[Unit] - PayOrderUseCase - execute - payment provider failure - marks failed and publishes PaymentFailedDomainEvent', async () => {
    const orderId = '550e8400-e29b-41d4-a716-446655440001';
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

    const paymentService = createPaymentServiceMock({
        success: false,
        failureReason: 'Insufficient funds',
    });

    const useCase = new PayOrderUseCase(unitOfWork, mockLogger, paymentService);

    const result = await useCase.execute(createValidInput(orderId, bookingId));

    assertEquals(typeof result, 'string');
    assertEquals(paymentService.payCallCount, 1);
    assertEquals(unitOfWork.saveCallCount, 2);

    const lastSaved = unitOfWork.savedEntities[unitOfWork.savedEntities.length - 1] as Payment;
    assertEquals(lastSaved.status, PaymentStatus.Failed);

    assertEquals(eventBus.publishedEvents.length, 1);
    const event = eventBus.publishedEvents[0];
    assert(event instanceof PaymentFailedDomainEvent);
    assertEquals(event.paymentId, result);
    assertEquals(event.orderId, orderId);
    assertEquals(event.bookingId, bookingId);
    assertEquals(event.reason, 'Insufficient funds');
});

Deno.test('[Unit] - PayOrderUseCase - execute - payment provider failure without reason - uses fallback reason and publishes PaymentFailedDomainEvent', async () => {
    const orderId = '550e8400-e29b-41d4-a716-446655440010';
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

    const paymentService = createPaymentServiceMock({ success: false });
    const useCase = new PayOrderUseCase(unitOfWork, mockLogger, paymentService);

    const result = await useCase.execute(createValidInput(orderId, bookingId));

    assertEquals(typeof result, 'string');
    assertEquals(paymentService.payCallCount, 1);
    assertEquals(unitOfWork.saveCallCount, 2);

    const lastSaved = unitOfWork.savedEntities[unitOfWork.savedEntities.length - 1] as Payment;
    assertEquals(lastSaved.status, PaymentStatus.Failed);

    assertEquals(eventBus.publishedEvents.length, 1);
    const event = eventBus.publishedEvents[0];
    assert(event instanceof PaymentFailedDomainEvent);
    assertEquals(event.paymentId, result);
    assertEquals(event.orderId, orderId);
    assertEquals(event.bookingId, bookingId);
    assertEquals(event.reason, 'Unknown error');
});

Deno.test('[Unit] - PayOrderUseCase - execute - unsupported payment method - throws and does not call provider or persist payment', async () => {
    const orderId = '550e8400-e29b-41d4-a716-446655440002';
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

    const paymentService = createPaymentServiceMock({ success: true });
    const useCase = new PayOrderUseCase(unitOfWork, mockLogger, paymentService);

    const invalidInput = {
        ...createValidInput(orderId, bookingId),
        paymentMethod: 'Crypto',
    };

    await assertRejects(
        () => useCase.execute(invalidInput),
        DomainException,
    );

    assertEquals(paymentService.payCallCount, 0);
    assertEquals(unitOfWork.saveCallCount, 0);
    assertEquals(eventBus.publishedEvents.length, 0);
});
