import { AmqpController } from '@/Infrastructure/Messaging/LavinMQ/Shared/mod.ts';
import { ChangeMovieDetailsUseCaseInput } from '@/Application/Ticketing/Movies/mod.ts';
import { Guard, IllegalArgumentException } from '@domaincrafters/std';
import { UseCase } from '@/Application/Ports/mod.ts';

export interface ChangeMovieDetailsRequest {
    movieId: string;
    title: string;
    duration: number;
    genres: string[];
    ageRating: number;
    posterUrl: string;
}

export class ChangeMovieDetailsController implements AmqpController<ChangeMovieDetailsRequest> {
    constructor(
        private readonly _changeMovieDetailsUseCase: UseCase<ChangeMovieDetailsUseCaseInput, void>,
    ) {}

    async handle(request: ChangeMovieDetailsRequest): Promise<void> {
        const input = this.extractInput(request as unknown);
        await this._changeMovieDetailsUseCase.execute(input);
    }

    private extractInput(request: unknown): ChangeMovieDetailsUseCaseInput {
        Guard.check(request, 'request').againstNullOrUndefined();

        if (typeof request !== 'object') {
            throw new IllegalArgumentException('Movie save payload must be a JSON object.');
        }

        const payload = request as Record<string, unknown>;
        if (Object.hasOwn(payload, 'payload')) {
            throw new IllegalArgumentException(
                "Unexpected wrapper field 'payload'. Expected direct fields: movieId, title, duration, genres, ageRating, posterUrl.",
            );
        }

        Guard.check(payload.movieId, 'movieId').isType('string').againstEmpty();
        Guard.check(payload.title, 'title').isType('string').againstEmpty();
        Guard.check(payload.duration, 'duration').isType('number').againstZero().againstNegative();
        Guard.check(payload.genres, 'genres').againstEmpty();

        if (!Array.isArray(payload.genres)) {
            throw new IllegalArgumentException('genres must be an array.');
        }

        const genres = payload.genres as unknown[];
        genres.forEach((genre: unknown) => {
            Guard.check(genre, 'genre').isType('string').againstEmpty();
        });

        Guard.check(payload.ageRating, 'ageRating').isType('number').againstZero()
            .againstNegative();
        Guard.check(payload.posterUrl, 'posterUrl').isType('string').againstEmpty();

        return {
            movieId: payload.movieId as string,
            title: payload.title as string,
            duration: payload.duration as number,
            genres: genres as string[],
            ageRating: payload.ageRating as number,
            posterUrl: payload.posterUrl as string,
        };
    }
}
