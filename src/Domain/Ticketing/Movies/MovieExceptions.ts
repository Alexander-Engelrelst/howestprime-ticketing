import { DomainException } from '@/Domain/Shared/mod.ts';

export class EmptyGenresListException extends DomainException {
    constructor() {
        super('Genres list cannot be empty');
    }
}
