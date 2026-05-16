import { 
    MovieId, MovieTitle, MovieDuration, Genre, AgeRating, PosterUrl 
} from '@/Domain/Ticketing/Movies/mod.ts';
import { EmptyListException, Money } from '@/Domain/Shared/mod.ts';
import { MovieInfo } from '@/Domain/Ticketing/Orders/mod.ts';
import { assert, assertEquals, assertThrows } from '@std/assert';

// Helper om mock data aan te maken
const createDefaultProps = () => ({
    movieId: MovieId.create("7b2e4a1f-8c3d-4e92-b5a1-f09c8d7e6b54"),
    title: MovieTitle.create("Inception"),
    duration: MovieDuration.create(148),
    genres: [Genre.create("Action"), Genre.create("Sci-Fi")],
    ageRating: AgeRating.create(18),
    posterUrl: PosterUrl.create("https://example.com/poster.jpg"),
    price: Money.create(12.50)
});

Deno.test("MovieInfo - should create a valid MovieInfo instance", () => {
    const props = createDefaultProps();
    const movieInfo = MovieInfo.create(
        props.movieId,
        props.title,
        props.duration,
        props.genres,
        props.ageRating,
        props.posterUrl,
        props.price
    );

    assertEquals(movieInfo.movieId, props.movieId);
    assertEquals(movieInfo.title, props.title);
    assertEquals(movieInfo.genres, props.genres);
    assertEquals(movieInfo.ageRating, props.ageRating);
    assertEquals(movieInfo.posterUrl, props.posterUrl);
    assertEquals(movieInfo.price, props.price);
    assertEquals(movieInfo.duration, props.duration);
});

Deno.test("MovieInfo.equals - should return true for structurally identical objects", () => {
    const props1 = createDefaultProps();
    const props2 = createDefaultProps();

    const movie1 = MovieInfo.create(props1.movieId, props1.title, props1.duration, props1.genres, props1.ageRating, props1.posterUrl, props1.price);
    const movie2 = MovieInfo.create(props2.movieId, props2.title, props2.duration, props2.genres, props2.ageRating, props2.posterUrl, props2.price);

    assert(movie1.equals(movie2), "Identical movies should be equal");
});

Deno.test("MovieInfo.equals - should return true even if genres are in a different order", () => {
    const props = createDefaultProps();
    const genresReversed = [...props.genres].reverse();

    const movie1 = MovieInfo.create(props.movieId, props.title, props.duration, props.genres, props.ageRating, props.posterUrl, props.price);
    const movie2 = MovieInfo.create(props.movieId, props.title, props.duration, genresReversed, props.ageRating, props.posterUrl, props.price);

    assert(movie1.equals(movie2), "Movies should be equal regardless of genre order");
});

Deno.test("MovieInfo.equals - should return false if any property differs", () => {
    const props = createDefaultProps();
    const movie1 = MovieInfo.create(props.movieId, props.title, props.duration, props.genres, props.ageRating, props.posterUrl, props.price);
    
    const differentMovie = MovieInfo.create(
        props.movieId,
        MovieTitle.create("Different Title"),
        props.duration,
        props.genres,
        props.ageRating,
        props.posterUrl,
        props.price
    );

    assert(!movie1.equals(differentMovie), "Movies with different titles should not be equal");
});

Deno.test("MovieInfo.equals - should return false if genres lengths differ", () => {
    const props = createDefaultProps();
    const movie1 = MovieInfo.create(props.movieId, props.title, props.duration, props.genres, props.ageRating, props.posterUrl, props.price);
    
    const movieWithExtraGenre = MovieInfo.create(
        props.movieId,
        props.title,
        props.duration,
        [...props.genres, Genre.create("Drama")],
        props.ageRating,
        props.posterUrl,
        props.price
    );
  
    assert(!movie1.equals(movieWithExtraGenre), "Movies with different number of genres should not be equal");
});

Deno.test("MovieInfo.validateState - should throw if genres list is empty", () => {
    const props = createDefaultProps();
    assertThrows(
        () => MovieInfo.create(props.movieId, props.title, props.duration, [], props.ageRating, props.posterUrl, props.price),
        EmptyListException,
        "Genres list cannot be empty"
    );
});