import { Logger, UnitOfWork, UseCase } from '@/Application/Ports/mod.ts';
import { Movie, MovieId, MovieRepository } from '@/Domain/Ticketing/Movies/mod.ts';
import { MovieNotFoundApplicationException } from '@/Application/Shared/mod.ts';
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

export interface CreateOrderFromBookingUseCaseInput {
    bookingId: string;
    movieId: string;
    room: string;
    showTime: Date;
    numberOfStandardTickets: number;
    numberOfDiscountedTickets: number;
    seatNumbers: number[];
}

export class CreateOrderFromBookingUseCase
    implements UseCase<CreateOrderFromBookingUseCaseInput, void> {
    constructor(
        private readonly _unitOfWork: UnitOfWork,
        private readonly _logger: Logger,
    ) {}

    async execute(input: CreateOrderFromBookingUseCaseInput): Promise<void> {
        this._logger.debug('Creating order from booking', { input });
        const movieRepository = this._unitOfWork.getRepository<MovieRepository>(Movie.name);

        const movieOpt = await movieRepository.byId(MovieId.create(input.movieId));

        if (!movieOpt.isPresent) {
            throw new MovieNotFoundApplicationException(input.movieId);
        }

        const movie = movieOpt.value;

        const movieInfo = MovieInfo.create(
            movie.id,
            movie.title,
            movie.duration,
            movie.genres,
            movie.ageRating,
            movie.posterUrl,
            movie.price,
        );

        const ticketList = TicketMappingService.mapToTickets(
            input.seatNumbers,
            [
                { type: VisitorType.Standard, quantity: input.numberOfStandardTickets },
                { type: VisitorType.Discounted, quantity: input.numberOfDiscountedTickets },
            ],
            movieInfo,
            RoomName.create(input.room),
            ShowTime.create(input.showTime),
        );
        const orderId = OrderId.create();

        const order = Order.create(
            orderId,
            BookingId.create(input.bookingId),
            ticketList,
        );

        await this._unitOfWork.do(async () => {
            await this._unitOfWork.save(order);

            this._logger.info('Order created from booking', {
                orderId: order.id.value,
                bookingId: order.bookingId.value,
            });
        });
    }
}
