import { assertEquals, assertThrows } from '@std/assert';
import { PosterUrl, InvalidPosterUrlException } from '@/Domain/Ticketing/Movies/mod.ts';

Deno.test('[Unit] - PosterUrl - create - valid https image url - returns normalized value object', () => {
    // Arrange
    const rawUrl = '  https://example.com/poster.jpg  ';

    // Act
    const posterUrl = PosterUrl.create(rawUrl);

    // Assert
    assertEquals(posterUrl.value, 'https://example.com/poster.jpg');
});

Deno.test('[Unit] - PosterUrl - create - valid http image url - returns value object', () => {
    // Arrange
    const rawUrl = 'http://cinema.org/movie.png';

    // Act
    const posterUrl = PosterUrl.create(rawUrl);

    // Assert
    assertEquals(posterUrl.value, rawUrl);
});

Deno.test('[Unit] - PosterUrl - create - empty or whitespace - throws InvalidPosterUrlException', () => {
    // Arrange
    const invalidInputs = ['', '   '];

    // Act & Assert
    for (const input of invalidInputs) {
        assertThrows(
            () => PosterUrl.create(input),
            InvalidPosterUrlException,
            "PosterUrl is not a valid URL: '[Empty or Whitespace]'"
        );
    }
});

Deno.test('[Unit] - PosterUrl - create - malformed url - throws InvalidPosterUrlException', () => {
    // Arrange
    const malformed = 'not-a-url';

    // Act & Assert
    assertThrows(
        () => PosterUrl.create(malformed),
        InvalidPosterUrlException,
        "PosterUrl is not a valid URL: 'not-a-url'"
    );
});

Deno.test('[Unit] - PosterUrl - create - invalid protocol - throws InvalidPosterUrlException', () => {
    // Arrange
    const ftpUrl = 'ftp://example.com/poster.jpg';

    // Act & Assert
    assertThrows(
        () => PosterUrl.create(ftpUrl),
        InvalidPosterUrlException
    );
});

Deno.test('[Unit] - PosterUrl - create - unsupported file extension - throws InvalidPosterUrlException', () => {
    // Arrange
    const nonImageUrl = 'https://example.com/movie.mp4';

    // Act & Assert
    assertThrows(
        () => PosterUrl.create(nonImageUrl),
        InvalidPosterUrlException
    );
});

Deno.test('[Unit] - PosterUrl - create - case-insensitive extension - returns value object', () => {
    // Arrange
    const uppercaseExt = 'https://example.com/POSTER.WEBP';

    // Act
    const posterUrl = PosterUrl.create(uppercaseExt);

    // Assert
    assertEquals(posterUrl.value, uppercaseExt);
});

Deno.test('[Unit] - PosterUrl - equals - identical urls - returns true', () => {
    // Arrange
    const url = 'https://site.com/img.png';
    const left = PosterUrl.create(url);
    const right = PosterUrl.create(`  ${url}  `);

    // Act
    const result = left.equals(right);

    // Assert
    assertEquals(result, true);
});

Deno.test('[Unit] - PosterUrl - equals - different urls - returns false', () => {
    // Arrange
    const left = PosterUrl.create('https://site.com/a.png');
    const right = PosterUrl.create('https://site.com/b.png');

    // Act
    const result = left.equals(right);

    // Assert
    assertEquals(result, false);
});