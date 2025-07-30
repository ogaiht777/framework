
import { World } from './World';
import { Component, ComponentType, getComponentType } from './Component';
import { EntityId } from './Entity';

/**
 * The base class for all Systems.
 * Systems contain the logic that operates on entities with specific components.
 * It's an abstract class, meant to be extended.
 */
export abstract class System {
    // A reference to the world the system operates on.
    protected world: World;

    /**
     * An optional list of component classes that an entity MUST have for this system to process it.
     * This can be used by a query engine to efficiently find relevant entities.
     */
    public requiredComponents?: { new(...args: any[]): Component }[];

    constructor(world: World) {
        this.world = world;
    }

    /**
     * This method is called every frame by the main game loop.
     * It should contain the logic for the system.
     * @param deltaTime The time in seconds since the last frame. Crucial for frame-rate independent logic.
     */
    abstract update(deltaTime: number): void;

    /**
     * This method is designed for batch processing of entities.
     * Systems can override this to process multiple entities efficiently.
     * @param entityIds An array of EntityIds to process.
     * @param world The World instance.
     */
    abstract processBatch(entityIds: EntityId[], world: World): void;
}
