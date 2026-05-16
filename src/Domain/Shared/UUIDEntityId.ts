/*
 * Copyright (c) 2024 Matthias Blomme and Dimitri Casier
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * modified by Alexander Engelrelst (13-05-2025)
 * Changes:
 * - modified the import for UUID with a modified version of the UUID library that allows for version agnostic parsing
 * - reason: to allow easier integration with external systems that may use different UUID versions
 */

import { UUID } from './UUID.ts';
import { type EntityId, ValueObject } from './mod.ts';

/**
 * Represents a UUID-based Entity Identifier in the context of Domain Driven Development.
 *
 * This abstract class provides a foundation for creating entity identifiers using UUIDs.
 * It ensures that each entity has a unique and consistent identifier across the domain.
 *
 * @example Usage
 * ```typescript
 * // Example of extending UUIDEntityId for a specific domain entity
 * class UserId extends UUIDEntityId {}
 *
 * // Generating a new UserID based on UUID
 * const userId = UserId.create();

 * // Comparing two UserIds for equality
 * const anotherUserId = UserId.create();
 * const isEqual = userId.equals(anotherUserId);
 * isEqual;
 *
 * // Getting the string representation of the UserId
 * userId.toString();
 *
 * // Accessing the UUID value directly
 * userId.value;
 * ```
 */

export abstract class UUIDEntityId extends ValueObject implements EntityId {
    protected readonly _id: string;

    /**
     * Creates an instance of UUIDEntityId.
     *
     * @param id - The optional UUID string value to use as the entity identifier. If not provided, a new UUID will be generated.
     */
    protected constructor(id?: string) {
        super();
        const uuid = id === undefined ? UUID.create() : UUID.parse(id);
        this._id = uuid.value;
    }

    /**
     * Compares this entity ID with another to determine equality.
     *
     * @param other - The other UUIDEntityId to compare with.
     * @returns `true` if both UUIDEntityIds have the same value and type, otherwise `false`.
     */
    equals(other: UUIDEntityId): boolean {
        return this._id === (other._id) && this.constructor === other.constructor;
    }

    /**
     * Returns the string representation of the entity ID.
     *
     * @returns The UUID string value of the entity ID.
     */
    override toString(): string {
        return this.value;
    }

    /**
     * Retrieves the UUID string value of the entity ID.
     *
     * @returns The UUID string value.
     */
    get value(): string {
        return this._id;
    }
}
