import { AggregateRoot, Money, UUIDEntityId } from '@/Domain/Shared/mod.ts';
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

// deliberately not using a separate externalMovieId field
// to my the fact that it would be called this implies this is conceptually the same thing 
// view through different lenses,
// I feel like the bounded context should be agnostic to the fact that this other lens even exists
// the UUID boilerplate was modified to be version agnostic 
export class Movie extends AggregateRoot<MovieId> {
    private static readonly PRICE_PER_MINUTE = 0.15;

    private readonly _title: MovieTitle;
    private readonly _duration: MovieDuration;
    private readonly _genres: Genre[];
    private readonly _ageRating: AgeRating;
    private readonly _posterUrl: PosterUrl;
    private readonly _price: Money;

    private constructor(
        id: MovieId,
        title: MovieTitle,
        duration: MovieDuration,
        genres: Genre[],
        ageRating: AgeRating,
        posterUrl: PosterUrl,
        price: Money,
    ) {
        super(id);
        this._title = title;
        this._duration = duration;
        this._genres = genres;
        this._ageRating = ageRating;
        this._posterUrl = posterUrl;
        this._price = price;
    }

    static create(
        id: MovieId,
        title: MovieTitle,
        duration: MovieDuration,
        genres: Genre[],
        ageRating: AgeRating,
        posterUrl: PosterUrl,
    ): Movie {
        const movie = new Movie(
            id,
            title,
            duration,
            genres,
            ageRating,
            posterUrl,
            Money.create(duration.value * Movie.PRICE_PER_MINUTE),
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

    private validate(): void {
        if (!this._id) throw new MissingMovieValueException('ID');
        if (!this._title) throw new MissingMovieValueException('Title');
        if (!this._duration) throw new MissingMovieValueException('Duration');
        if (!this._genres) throw new MissingMovieValueException('Genres');
        if (!this._ageRating) throw new MissingMovieValueException('Age Rating');
        if (!this._posterUrl) throw new MissingMovieValueException('Poster URL');
        if (!this._price) throw new MissingMovieValueException('Price');
        
        if (this._genres.length === 0) throw new EmptyGenresListException();

    }
}
