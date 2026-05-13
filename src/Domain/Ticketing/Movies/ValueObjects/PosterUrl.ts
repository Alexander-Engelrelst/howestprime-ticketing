import { DomainException, ValueObject } from '@/Domain/Shared/mod.ts';

const IMAGE_URL_EXTENSIONS = [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.bmp',
    '.webp',
    '.svg',
    '.avif',
    '.tiff',
];
export class InvalidPosterUrlException extends DomainException {
    constructor(value: string) {
        const displayValue = value.trim().length === 0 ? '[Empty or Whitespace]' : value;

        super(`PosterUrl is not a valid URL: '${displayValue}'`);
    }
}

export class PosterUrl extends ValueObject {
    private readonly _value: string;

    private constructor(value: string) {
        super();
        this._value = value;
    }

    static create(value: string): PosterUrl {
        const normalized = value.trim();
        const instance = new PosterUrl(normalized);
        instance.validate();
        return instance;
    }

    protected validate(): void {
        if (!this._value || this._value.length === 0) {
            throw new InvalidPosterUrlException(this._value);
        }

        let url: URL;
        try {
            url = new URL(this._value);
        } catch {
            throw new InvalidPosterUrlException(this._value);
        }

        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            throw new InvalidPosterUrlException(this._value);
        }

        const pathname = url.pathname.toLowerCase();

        if (!IMAGE_URL_EXTENSIONS.some((ext) => pathname.endsWith(ext))) {
            throw new InvalidPosterUrlException(this._value);
        }
    }

    override equals(other: PosterUrl): boolean {
        return other?._value === this._value;
    }

    get value(): string {
        return this._value;
    }
}
