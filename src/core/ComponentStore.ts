import { Component } from './Component';
import { EntityId } from './Entity';

/**
 * A highly optimized storage for a single type of component.
 * It uses an array where the index corresponds to the EntityId for O(1) access.
 */
export class ComponentStore<T extends Component> {
    // Direct array access using EntityId as index. This is the fastest way.
    private components: (T | undefined)[] = [];

    // A Set for fast checking of which entities have this component.
    // O(1) average time complexity for add, delete, and has.
    private entityMap = new Set<EntityId>();

    // Object pool for recycling component instances to reduce garbage collection.
    private componentPool: T[] = []; // Added

    /**
     * Adds a component for a given entity.
     * @param entityId The ID of the entity.
     * @param component The component instance.
     */
    add(entityId: EntityId, component: T): void {
        this.components[entityId] = component;
        this.entityMap.add(entityId);
    }

    /**
     * Retrieves the component for a given entity.
     * @param entityId The ID of the entity.
     * @returns The component, or undefined if the entity does not have it.
     */
    get(entityId: EntityId): T | undefined {
        return this.components[entityId];
    }

    /**
     * Checks if an entity has this component.
     * @param entityId The ID of the entity.
     * @returns True if the entity has the component, false otherwise.
     */
    has(entityId: EntityId): boolean {
        return this.entityMap.has(entityId);
    }

    /**
     * Removes a component from an entity and returns it to the pool.
     * @param entityId The ID of the entity.
     */
    remove(entityId: EntityId): void {
        if (this.has(entityId)) {
            this.entityMap.delete(entityId);
            const component = this.components[entityId];
            if (component) {
                this.componentPool.push(component); // Return to pool
            }
            // We set to undefined instead of splicing to avoid re-indexing the array,
            // which would be a very slow O(n) operation.
            this.components[entityId] = undefined;
        }
    }

    /**
     * Gets an iterable of all entity IDs that have this component.
     * This is used by Systems to iterate over entities they care about.
     */
    getEntities(): Iterable<EntityId> {
        return this.entityMap.values();
    }

    /**
     * Gets the number of entities that have this component.
     * This is an O(1) operation.
     * @returns The number of entities.
     */
    getEntitiesCount(): number {
        return this.entityMap.size;
    }

    /**
     * Retrieves a component instance from the pool, or creates a new one if the pool is empty.
     * @param componentConstructor The constructor function of the component.
     * @returns A recycled or new component instance.
     */
    getOrCreate(componentConstructor: { new(...args: any[]): T }): T {
        if (this.componentPool.length > 0) {
            return this.componentPool.pop()!;
        }
        return new componentConstructor();
    }
}