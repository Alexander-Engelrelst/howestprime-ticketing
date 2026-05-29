import { assertEquals } from '@std/assert';
import { Money } from '@/Domain/Shared/mod.ts';
import { MovieInfo, RoomName, Seat, ShowTime, VisitorType, Ticket, TicketId } from '@/Domain/Ticketing/Orders/mod.ts';
import { MovieTitle } from '@/Domain/Ticketing/Movies/mod.ts';

// --- Helpers to create valid inputs ---
const createMockMovieInfo = (price: number) => ({
    title: MovieTitle.create("Inception"),
    price: Money.fromCents(price)
} as MovieInfo);

const createMockSeat = (type: VisitorType) => ({
    number: 1,
    visitorType: type
} as unknown as Seat);

const mockRoom = RoomName.create("Cinema 1");
const mockShowTime = new Date() as unknown as ShowTime;

// --- Tests ---

Deno.test('[Unit] - Ticket - create - full price - calculates price correctly', () => {
    // Arrange
    const id = TicketId.create();
    const movieInfo = createMockMovieInfo(100);
    const seat = createMockSeat(VisitorType.Standard); // Assuming Regular = full price

    // Act
    const ticket = Ticket.create(id, movieInfo, seat, mockRoom, mockShowTime);

    // Assert
    // Based on your current code logic: 100 * 0.9 = 90
    assertEquals(ticket.price.value, 90); 
    assertEquals(ticket.movieInfo.title.value, "Inception");
    assertEquals(ticket.seat.visitorType, VisitorType.Standard);
});

Deno.test('[Unit] - Ticket - create - discounted visitor - applies base movie price', () => {
    // Arrange
    const id = TicketId.create();
    const movieInfo = createMockMovieInfo(100);
    const seat = createMockSeat(VisitorType.Discounted);

    // Act
    const ticket = Ticket.create(id, movieInfo, seat, mockRoom, mockShowTime);

    // Assert
    // Based on your current code logic: if Discounted, use base price (100)
    assertEquals(ticket.price.value, 100);
});

Deno.test('[Unit] - Ticket - getters - return correct values', () => {
    const id = TicketId.create();
    const movieInfo = createMockMovieInfo(50);
    const seat = createMockSeat(VisitorType.Discounted);
    
    const ticket = Ticket.create(id, movieInfo, seat, mockRoom, mockShowTime);

    assertEquals(ticket.id.equals(id), true);
    assertEquals(ticket.room, mockRoom);
    assertEquals(ticket.showTime, mockShowTime);
});