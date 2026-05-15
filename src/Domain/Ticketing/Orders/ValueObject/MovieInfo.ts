import { EmptyListException, Money, ValueObject } from '@/Domain/Shared/mod.ts';
import { AgeRating, Genre, MovieDuration, MovieId, MovieTitle, PosterUrl } from '@/Domain/Ticketing/Movies/mod.ts';

export class MovieInfo extends ValueObject {
    private readonly _movieId: MovieId;
    private readonly _title: MovieTitle;
    private readonly _duration: MovieDuration;
    private readonly _genres: Genre[];
    private readonly _ageRating: AgeRating;
    private readonly _posterUrl: PosterUrl;
    private readonly _price: Money;

    private constructor(
        movieId: MovieId,
        title: MovieTitle,
        duration: MovieDuration,
        genres: Genre[],
        ageRating: AgeRating,
        posterUrl: PosterUrl,
        price: Money,
    ) {
        super();
        this._movieId = movieId;
        this._title = title;
        this._duration = duration;
        this._genres = genres;
        this._ageRating = ageRating;
        this._posterUrl = posterUrl;
        this._price = price;
    }

    static create(
        movieId: MovieId,
        title: MovieTitle,
        duration: MovieDuration,
        genres: Genre[],
        ageRating: AgeRating,
        posterUrl: PosterUrl,
        price: Money,
    ): MovieInfo {
        const movieInfo = new MovieInfo(movieId, title, duration, genres, ageRating, posterUrl, price);
        movieInfo.validateState();

        return movieInfo;
    }

    get movieId(): MovieId {
        return this._movieId;
    }

    get title(): MovieTitle {
        return this._title;
    }

    get duration(): MovieDuration {
        return this._duration;
    }

    get genres(): Genre[] {
        return this._genres;
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
    
    override equals(other: ValueObject): boolean {
        return (
            other instanceof MovieInfo &&
            other._movieId.equals(this._movieId) &&
            other._title.equals(this._title) &&
            other._duration.equals(this._duration) &&
            this.areGenresEqual(other._genres) &&
            other._ageRating.equals(this._ageRating) &&
            other._posterUrl.equals(this._posterUrl) &&
            other._price.equals(this._price)
        );
    }

    private areGenresEqual(otherGenres: Genre[]): boolean {
        if (this._genres.length !== otherGenres.length) {
            return false;
        }

        const sortedThisGenres = [...this._genres].sort((a, b) => a.value.localeCompare(b.value));
        const sortedOtherGenres = [...otherGenres].sort((a, b) => a.value.localeCompare(b.value));

        return sortedThisGenres.every((genre, index) => genre.equals(sortedOtherGenres[index]!));
    }

    private validateState(): void {
        if (this._genres.length === 0) {
            throw new EmptyListException('Genres');
        }
    }
}

