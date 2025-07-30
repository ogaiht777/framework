
export type EntityId = number;

// This is a simple counter for generating unique entity IDs.
// It's fast and sufficient for server-side entity management.
let nextEntityId = 0;

/**
 * Represents an entity in the ECS world.
 * It is essentially just a unique identifier.
 */
export class Entity {
    public readonly id: EntityId;

    constructor() {
        this.id = nextEntityId++;
    }
}
