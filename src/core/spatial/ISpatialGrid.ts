
import { EntityId } from '../Entity';

/**
 * Defines the contract for a spatial partitioning grid.
 * This allows for efficient querying of entities based on their position.
 */
import { World } from '../World';

export interface ISpatialGrid {
    // Constructor should ideally receive the World instance for component access
    // constructor(world: World);

    /**
     * Adds an entity to the spatial grid at the given coordinates.
     * @param entityId The ID of the entity to add.
     * @param x The X coordinate.
     * @param y The Y coordinate.
     * @param z The Z coordinate.
     */
    add(entityId: EntityId, x: number, y: number, z: number): void;

    /**
     * Removes an entity from the spatial grid at the given coordinates.
     * @param entityId The ID of the entity to remove.
     * @param x The X coordinate.
     * @param y The Y coordinate.
     * @param z The Z coordinate.
     */
    remove(entityId: EntityId, x: number, y: number, z: number): void;

    /**
     * Updates the position of an entity in the spatial grid.
     * @param entityId The ID of the entity to update.
     * @param oldX The old X coordinate.
     * @param oldY The old Y coordinate.
     * @param oldZ The old Z coordinate.
     * @param newX The new X coordinate.
     * @param newY The new Y coordinate.
     * @param newZ The new Z coordinate.
     */
    update(entityId: EntityId, oldX: number, oldY: number, oldZ: number, newX: number, newY: number, newZ: number): void;

    /**
     * Queries for entities within a specified radius of a given point.
     * @param x The X coordinate of the query center.
     * @param y The Y coordinate of the query center.
     * @param z The Z coordinate of the query center.
     * @param radius The radius of the query sphere.
     * @returns An array of EntityIds found within the query radius.
     */
    query(x: number, y: number, z: number, radius: number): EntityId[];
}
