import { AmqpController } from '@/Infrastructure/Messaging/LavinMQ/Shared/mod.ts';
import { SaveMovieUseCaseInput } from '@/Application/Ticketing/Movies/mod.ts';
import { UseCase } from '@/Application/Ports/mod.ts';
import { Guard, IllegalArgumentException } from '@domaincrafters/std';

export interface SaveMovieRequest {
    movieId: string;
    title: string;
    duration: number;
    genres: string[];
    ageRating: number;
    posterUrl: string;
}

export class SaveMovieController implements AmqpController<SaveMovieRequest> {
    constructor(
        private readonly _saveMovieUseCase: UseCase<SaveMovieUseCaseInput, void>,
    ) {}

    async handle(request: SaveMovieRequest): Promise<void> {
        const input = this.extractInput(request as unknown);
        await this._saveMovieUseCase.execute(input);
    }

    private extractInput(request: unknown): SaveMovieUseCaseInput {
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

        Guard.check(payload.movieId, 'movieId').againstEmpty();
        Guard.check(payload.title, 'title').againstEmpty();
        Guard.check(payload.duration, 'duration').againstZero().againstNegative();
        Guard.check(payload.genres, 'genres').againstEmpty();
        
        if (!Array.isArray(payload.genres)) {
            throw new IllegalArgumentException('genres must be an array.');
        }

        const genres = payload.genres as unknown[];
        genres.forEach((genre: unknown) => {
            Guard.check(genre, 'genre').isType('string');
            Guard.check(genre, 'genre').againstEmpty();
        });
        
        Guard.check(payload.ageRating, 'ageRating').againstZero().againstNegative();
        Guard.check(payload.posterUrl, 'posterUrl').againstEmpty();

        return {
            externalId: payload.movieId as string,
            title: payload.title as string,
            duration: payload.duration as number,
            genres: genres as string[],
            ageRating: payload.ageRating as number,
            posterUrl: payload.posterUrl as string,
        };
    }
}

