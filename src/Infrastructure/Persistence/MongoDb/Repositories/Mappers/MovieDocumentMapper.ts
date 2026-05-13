import { AgeRating, Genre, Movie, MovieId, PosterUrl } from '@/Domain/Ticketing/Movies/mod.ts';
import type { DocumentMapper } from '@/Infrastructure/Persistence/MongoDb/Shared/mod.ts';
import type { Document } from '@mongodb';
import { serializeObjectToDocument } from '../../Shared/DocumentMapper.ts';
import { ExternalId, Money } from '@/Domain/Shared/mod.ts';

export class MovieDocumentMapper implements DocumentMapper<Movie> {
    toDocument(movie: Movie): Document {
        const movieWithVersion = movie as unknown as { __v: number };

        // TODO(alexander): if time remains add incrementing version number,
        // remove upsert functionality and add retry logic/policy in the application layer
        const document = serializeObjectToDocument({
            _id: movie.id.toString(),
            title: movie.title.value,
            duration: movie.duration.value,
            genres: movie.genres.map((genre) => genre.value),
            ageRating: movie.ageRating.value,
            posterUrl: movie.posterUrl.value,
            price: movie.price.value,
            externalId: movie.externalId.value,
            __v: movieWithVersion.__v || 0,
        });
        return document;
    }

    reconstitute(document: Document): Movie {
        const movie = this.reconsituteFromDocument(
            document._id,
            document.title,
            document.duration,
            document.genres,
            document.ageRating,
            document.posterUrl,
            document.price,
            document.externalId,
        );

        if (document.__v !== undefined) {
            (movie as unknown as { __v: number }).__v = document.__v;
        }

        return movie;
    }

    private reconsituteFromDocument(
        id: string,
        title: string,
        duration: number,
        genres: string[],
        ageRating: number,
        posterUrl: string,
        price: number,
        externalId: string,
    ): Movie {
        const movie = Object.create(Movie.prototype);
        movie['_id'] = MovieId.create(id);
        movie['_title'] = title;
        movie['_duration'] = duration;
        movie['_genres'] = genres.map(Genre.create);
        movie['_ageRating'] = AgeRating.create(ageRating);
        movie['_posterUrl'] = PosterUrl.create(posterUrl);
        movie['_price'] = Money.create(price);
        movie['_externalId'] = ExternalId.create(externalId);
        movie['__v'] = 0; // will be set by the reconsitute method

        return movie as Movie;
    }
}
