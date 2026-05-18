import {
    AgeRating,
    Genre,
    Movie,
    MovieDuration,
    MovieId,
    MovieTitle,
    PosterUrl,
} from '@/Domain/Ticketing/Movies/mod.ts';
import type { DocumentMapper } from '@/Infrastructure/Persistence/MongoDb/Shared/mod.ts';
import type { Document } from '@mongodb';
import { serializeObjectToDocument } from '../../Shared/DocumentMapper.ts';
import { Money } from '@/Domain/Shared/mod.ts';

interface movieDocumentShape {
    _id?: string;
    id?: string;
    title: string;
    duration: number;
    genres: string[];
    ageRating: number;
    posterUrl: string;
    price: number;
}

export class MovieDocumentMapper implements DocumentMapper<Movie> {
    toDocument(movie: Movie): Document {
        const document = serializeObjectToDocument({
            _id: movie.id.value,
            title: movie.title.value,
            duration: movie.duration.value,
            genres: movie.genres.map((genre) => genre.value),
            ageRating: movie.ageRating.value,
            posterUrl: movie.posterUrl.value,
            price: movie.price.value,
        });
        return document;
    }

    reconstitute(document: Document): Movie {
        const movieData = document as movieDocumentShape;

        const movie = Object.create(Movie.prototype);
        movie['_id'] = MovieId.create(movieData._id ?? movieData.id);
        movie['_title'] = MovieTitle.create(movieData.title);
        movie['_duration'] = MovieDuration.create(movieData.duration);
        movie['_genres'] = movieData.genres.map((g: string) => Genre.create(g));
        movie['_ageRating'] = AgeRating.create(movieData.ageRating);
        movie['_posterUrl'] = PosterUrl.create(movieData.posterUrl);
        movie['_price'] = Money.create(movieData.price);
        movie['_domainEvents'] = [];

        return movie as Movie;
    }
}
