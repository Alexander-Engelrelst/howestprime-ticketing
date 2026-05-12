import { AggregateRoot, ExternalId, Money, UUIDEntityId } from '@/Domain/Shared/mod.ts';
import { AgeRating, Genre, MovieDuration, MovieTitle, PosterUrl } from '@/Domain/Ticketing/Movies/mod.ts';


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
        externalId: ExternalId
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
        title: string,
        duration: number,
        genres: string[],
        ageRating: number,
        posterUrl: string,
        externalId: string
    ): Movie {
        return new Movie(
            MovieId.create(),
            MovieTitle.create(title),
            MovieDuration.create(duration),
            genres.map(Genre.create),
            AgeRating.create(ageRating),
            PosterUrl.create(posterUrl),
            Money.create(duration * Movie.PRICE_PER_MINUTE), // todo(alexander) must create do this?
            ExternalId.create(externalId)
        );
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

}