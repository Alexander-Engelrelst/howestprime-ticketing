export class ApplicationException extends Error {
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export class NotFoundApplicationException extends ApplicationException {}

export class SuggestionNotFoundApplicationException extends NotFoundApplicationException {
    constructor(suggestionId: string) {
        super(`Suggestion with id '${suggestionId}' was not found.`);
    }
}

export class MovieNotFoundApplicationException extends NotFoundApplicationException {
    constructor(movieId: string) {
        super(`Movie with id '${movieId}' was not found.`);
    }
}

export class OrderNotFoundApplicationException extends NotFoundApplicationException {
    constructor(orderId: string) {
        super(`Order with id '${orderId}' was not found.`);
    }
}

export class OrderForBookingNotFoundApplicationException extends NotFoundApplicationException {
    constructor(bookingId: string) {
        super(`Order for booking id '${bookingId}' was not found.`);
    }
}
