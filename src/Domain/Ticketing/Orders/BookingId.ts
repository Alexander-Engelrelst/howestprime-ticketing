import { UUIDEntityId } from '@/Domain/Shared/mod.ts';

export class BookingId extends UUIDEntityId {
    static create(value?: string): BookingId {
        return new BookingId(value);
    }

    private constructor(value?: string) {
        super(value);
    }
}
