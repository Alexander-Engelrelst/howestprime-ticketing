import { assertEquals, assertThrows } from '@std/assert';
import { 
    TicketMappingService, 
    VisitorType, 
    MovieInfo, 
    RoomName, 
    ShowTime,
    TicketQuantityMismatchException 
} from '@/Domain/Ticketing/Orders/mod.ts';
import { Money } from '@/Domain/Shared/mod.ts';
import { AgeRating, Genre, MovieDuration, MovieId, MovieTitle, PosterUrl } from '@/Domain/Ticketing/Movies/mod.ts';

/**
 * Helper to create valid MovieInfo for the service
 */
const createValidMovieInfo = () => MovieInfo.create(
    MovieId.create(),
    MovieTitle.create('Inception'),
    MovieDuration.create(148),
    [Genre.create('Sci-Fi')],
    AgeRating.create(12),
    PosterUrl.create('https://example.com/poster.jpg'),
    Money.create(1500)
);

Deno.test('[Unit] - TicketMappingService - mapToTickets - successful mapping', () => {
    // Arrange
    const seatNumbers = [10, 11, 12];
    const visitorTypes = [
        { type: VisitorType.Standard, quantity: 2 },
        { type: VisitorType.Discounted, quantity: 1 }
    ];
    const movieInfo = createValidMovieInfo();
    const room = RoomName.create('Screen 1');
    const showTime = ShowTime.create(new Date());

    // Act
    const tickets = TicketMappingService.mapToTickets(
        seatNumbers,
        visitorTypes,
        movieInfo,
        room,
        showTime
    );

    // Assert
    assertEquals(tickets.length, 3);
    assertEquals(tickets[0]!.seat.seatNumber, 10);
    assertEquals(tickets[0]!.seat.visitorType, VisitorType.Standard);
    assertEquals(tickets[2]!.seat.seatNumber, 12);
    assertEquals(tickets[2]!.seat.visitorType, VisitorType.Discounted);
});

Deno.test('[Unit] - TicketMappingService - mapToTickets - quantity mismatches', async (t) => {
    const movieInfo = createValidMovieInfo();
    const room = RoomName.create('Screen 1');
    const showTime = ShowTime.create(new Date());

    await t.step('throws when more seats than tickets',() => {
        const seatNumbers = [10, 11, 12]; // 3 seats
        const visitorTypes = [{ type: VisitorType.Standard, quantity: 1 }]; // 1 ticket

        assertThrows(
            () => TicketMappingService.mapToTickets(seatNumbers, visitorTypes, movieInfo, room, showTime),
            TicketQuantityMismatchException
        );
    });

    await t.step('throws when more tickets than seats', () => {
        const seatNumbers = [10]; // 1 seat
        const visitorTypes = [{ type: VisitorType.Standard, quantity: 5 }]; // 5 tickets

        assertThrows(
            () => TicketMappingService.mapToTickets(seatNumbers, visitorTypes, movieInfo, room, showTime),
            TicketQuantityMismatchException
        );
    });
});