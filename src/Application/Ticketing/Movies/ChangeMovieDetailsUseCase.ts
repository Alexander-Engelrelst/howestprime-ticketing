import { Logger, UnitOfWork, UseCase } from '@/Application/Ports/mod.ts';
import { AgeRating, Genre, Movie, MovieDuration, MovieId, MovieRepository, PosterUrl } from '@/Domain/Ticketing/Movies/mod.ts';
import { MovieTitle } from '@/Domain/Ticketing/Movies/ValueObjects/MovieTitle.ts';

export interface ChangeMovieDetailsUseCaseInput {
    title: string;
    duration: number;
    genres: string[];
    ageRating: number;
    posterUrl: string;
    movieId: string;
}

export class ChangeMovieDetailsUseCase implements UseCase<ChangeMovieDetailsUseCaseInput, void> {
    constructor(
        private readonly _unitOfWork: UnitOfWork,
        private readonly _logger: Logger,
    ) {}

    async execute(input: ChangeMovieDetailsUseCaseInput): Promise<void> {
        this._logger.debug('Changing movie details', { input });

        await this._unitOfWork.do(async () => {
            const movieId = MovieId.create(input.movieId);
            const movieRepository = await this._unitOfWork.getRepository<MovieRepository>(Movie.name)
            const movieOpt = await movieRepository.byId(movieId);

            if (!movieOpt.isPresent) {
                this._logger.warn('Movie not found', { movieId: input.movieId });
                // for simpilicity rollback procedures are omitted
                return;
            }

            const movie = movieOpt.value;
            movie.changeDetails(
                MovieTitle.create(input.title),
                MovieDuration.create(input.duration),
                input.genres.map((genre) => Genre.create(genre)),
                AgeRating.create(input.ageRating),
                PosterUrl.create(input.posterUrl),
            );

            await this._unitOfWork.save(movie);

            this._logger.info('Movie details changed', {
                movieId: movie.id.value,
            });
        });
    }
}