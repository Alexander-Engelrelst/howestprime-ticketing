import { AgeRating, Genre, Movie, MovieDuration, MovieId, MovieTitle, PosterUrl } from '@/Domain/Ticketing/Movies/mod.ts';
import type { DocumentMapper } from '@/Infrastructure/Persistence/MongoDb/Shared/mod.ts';
import type { Document } from '@mongodb';
import { serializeObjectToDocument } from '../../Shared/DocumentMapper.ts';
import { Money } from '@/Domain/Shared/mod.ts';

export class MovieDocumentMapper implements DocumentMapper<Movie> {
    toDocument(movie: Movie): Document {
      const document = serializeObjectToDocument({
            _id: movie.id.toString(),
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
        const movie = Object.create(Movie.prototype);
        movie['_id'] = MovieId.create(document.id ?? document._id);
        movie['_title'] = MovieTitle.create(document.title);
        movie['_duration'] = MovieDuration.create(document.duration);
        movie['_genres'] = document.genres.map((g) => Genre.create(g));
        movie['_ageRating'] = AgeRating.create(document.ageRating);
        movie['_posterUrl'] = PosterUrl.create(document.posterUrl);
        movie['_price'] = Money.create(document.price);
        movie['_domainEvents'] = [];

        return movie as Movie;
    }
    
}
