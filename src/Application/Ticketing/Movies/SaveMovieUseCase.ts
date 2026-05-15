import {
    AgeRating,
    Genre,
    Movie,
    MovieDuration,
    MovieId,
    MovieTitle,
    PosterUrl,
} from '@/Domain/Ticketing/Movies/mod.ts';
import { Logger, UnitOfWork, UseCase } from '@/Application/Ports/mod.ts';

export interface SaveMovieUseCaseInput {
    title: string;
    duration: number;
    genres: string[];
    ageRating: number;
    posterUrl: string;
    movieId: string;
}

export class SaveMovieUseCase implements UseCase<SaveMovieUseCaseInput, void> {
    constructor(
        private readonly _unitOfWork: UnitOfWork,
        private readonly _logger: Logger,
    ) {}

    async execute(input: SaveMovieUseCaseInput): Promise<void> {
        this._logger.debug('Saving movie', { input });

        await this._unitOfWork.do(async () => {
            const movie = Movie.create(
                MovieId.create(input.movieId),
                MovieTitle.create(input.title),
                MovieDuration.create(input.duration),
                input.genres.map(Genre.create),
                AgeRating.create(input.ageRating),
                PosterUrl.create(input.posterUrl),
            );

            await this._unitOfWork.save(movie);

            this._logger.info('Movie saved', {
                movieId: movie.id.value,
            });
        });
    }
}
