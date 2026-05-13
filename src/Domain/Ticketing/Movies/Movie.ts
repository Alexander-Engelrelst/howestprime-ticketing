import { AggregateRoot, ExternalId, Money, UUIDEntityId } from '@/Domain/Shared/mod.ts';
import {
    AgeRating,
    Genre,
    MovieDuration,
    MovieTitle,
    PosterUrl,
} from '@/Domain/Ticketing/Movies/mod.ts';
import { EmptyGenresListException, MissingMovieValueException } from './MovieExceptions.ts';

export class MovieId extends UUIDEntityId {
    private constructor(id?: string) {
        super(id);
    }

    static create(value?: string): MovieId {
        return new MovieId(value);
    }
}

export class Movie extends AggregateRoot<MovieId> {
    private static readonly PRICE_PER_MINUTE = 0.15;

    private readonly _title: MovieTitle;
    private readonly _duration: MovieDuration;
    private readonly _genres: Genre[];
    private readonly _ageRating: AgeRating;
    private readonly _posterUrl: PosterUrl;
    private readonly _price: Money;
    private readonly _externalId: ExternalId;

    private constructor(
        id: MovieId,
        title: MovieTitle,
        duration: MovieDuration,
        genres: Genre[],
        ageRating: AgeRating,
        posterUrl: PosterUrl,
        price: Money,
        externalId: ExternalId,
    ) {
        super(id);
        this._title = title;
        this._duration = duration;
        this._genres = genres;
        this._ageRating = ageRating;
        this._posterUrl = posterUrl;
        this._price = price;
        this._externalId = externalId;
    }

    static create(
        title: MovieTitle,
        duration: MovieDuration,
        genres: Genre[],
        ageRating: AgeRating,
        posterUrl: PosterUrl,
        externalId: ExternalId,
    ): Movie {
        const movie = new Movie(
            MovieId.create(),
            title,
            duration,
            genres,
            ageRating,
            posterUrl,
            Money.create(duration.value * Movie.PRICE_PER_MINUTE),
            externalId,
        );

        movie.validate();
        return movie;
    }

    override get id(): MovieId {
        return super.id as MovieId;
    }

    get title(): MovieTitle {
        return this._title;
    }

    get duration(): MovieDuration {
        return this._duration;
    }

    get genres(): Genre[] {
        // genres are valueobject and thus immutable, we can use shallow copy TODO: ask about this
        return [...this._genres];
    }

    get ageRating(): AgeRating {
        return this._ageRating;
    }

    get posterUrl(): PosterUrl {
        return this._posterUrl;
    }

    get price(): Money {
        return this._price;
    }

    get externalId(): ExternalId {
        return this._externalId;
    }

    private validate(): void {
        if (!this._id) throw new MissingMovieValueException('ID');
        if (!this._title) throw new MissingMovieValueException('Title');
        if (!this._duration) throw new MissingMovieValueException('Duration');
        if (!this._genres) throw new MissingMovieValueException('Genres');
        if (!this._ageRating) throw new MissingMovieValueException('Age Rating');
        if (!this._posterUrl) throw new MissingMovieValueException('Poster URL');
        if (!this._price) throw new MissingMovieValueException('Price');
        if (!this._externalId) throw new MissingMovieValueException('External ID');
        
        if (this._genres.length === 0) throw new EmptyGenresListException();

    }
}
