import { DomainException } from '@/Domain/Shared/mod.ts';

export class EmptyListException extends DomainException {
    constructor(propertyName: string) {
        super(`${propertyName} list cannot be empty`);
    }
}