import { Component, ComponentType, getComponentType, getComponentName } from './Component';
import { ComponentStore } from './ComponentStore';
import { Entity, EntityId } from './Entity';
import { System } from './System';
import { EventBus } from '../services/EventBus';
import { NetworkEventBus } from '../services/NetworkEventBus';
import { PlayerConnectionSystem } from '../services/PlayerConnectionSystem';
import { DIContainer } from '../services/DIContainer';
import { DebugService } from '../services/DebugService';
import { MemoryProfilerService } from '../services/MemoryProfilerService';
import { ValidationService } from '../services/ValidationService';
import { AntiCheatService } from '../services/AntiCheatService';
import { RateLimitingService } from '../services/RateLimitingService';
import { InputSanitizationService } from '../services/InputSanitizationService';
import { ISpatialGrid } from './spatial/ISpatialGrid'; // Added
import { SimpleSpatialGrid } from './spatial/SimpleSpatialGrid'; // Added
import { PositionComponent } from './components/PositionComponent'; // Added
import { BatchMovementSystem } from '../../examples/chat/BatchMovementSystem'; // Import BatchMovementSystem

/**
 * The central manager for the ECS world.
 * It handles entity creation/destruction, component management, and system execution.
 */
export class World {
    // An object pool for entities to reduce garbage collection overhead.
    private entityPool: Entity[] = [];
    private nextEntityId = 0;

    // Stores all component stores, indexed by ComponentType for O(1) access.
    private componentStores: (ComponentStore<any> | undefined)[] = [];

    // Stores all registered systems. The order of registration is the order of execution.
    private systems: System[] = [];

    // Public access to the event bus for decoupled communication.
    public readonly eventBus: EventBus;

    // Performance monitoring tools
    private isMonitoringEnabled = false;
    private performanceMetrics = new Map<string, number>();

    // Public access to the Dependency Injection Container
    public readonly diContainer: DIContainer;

    // Spatial partitioning grid for optimized position queries
    private spatialGrid: ISpatialGrid; // Added

    constructor() {
        try {
            this.diContainer = new DIContainer();
            this.eventBus = new NetworkEventBus();
            this.spatialGrid = new SimpleSpatialGrid(this); // Initialized with World instance

            // Register core services in the DI container
            this.diContainer.register(World, this);
            this.diContainer.register(EventBus, this.eventBus);
            this.diContainer.register(DebugService, new DebugService(this));
            this.diContainer.register(MemoryProfilerService, new MemoryProfilerService());
            this.diContainer.register(ValidationService, new ValidationService());
            this.diContainer.register(AntiCheatService, new AntiCheatService(this.eventBus));
            this.diContainer.register(RateLimitingService, new RateLimitingService());
            this.diContainer.register(InputSanitizationService, new InputSanitizationService());

            // Register core systems
            this.registerSystem(new PlayerConnectionSystem(this));
            this.registerSystem(new BatchMovementSystem(this)); // Register BatchMovementSystem

            console.log('[World] ECS World initialized successfully.');
        } catch (error) {
            console.error('[World] Error during ECS World initialization:', error);
        }
    }

    /**
     * Creates a new entity or recycles one from the pool.
     * @returns The created or recycled entity.
     */
    createEntity(): Entity {
        if (this.entityPool.length > 0) {
            const entity = this.entityPool.pop()!;
            return entity;
        }
        return new Entity();
    }

    /**
     * Destroys an entity, removing all its components and returning it to the pool.
     * @param entityId The ID of the entity to destroy.
     */
    destroyEntity(entityId: EntityId): void {
        // Remove components and return to pool
        for (const store of this.componentStores) {
            if (store?.has(entityId)) {
                // If it has a PositionComponent, remove from spatial grid
                if (store.get(entityId) instanceof PositionComponent) {
                    const pos = store.get(entityId) as PositionComponent;
                    this.spatialGrid.remove(entityId, pos.x, pos.y, pos.z);
                }
                store.remove(entityId);
            }
        }
        // Return entity to pool
        this.entityPool.push({ id: entityId });
    }

    /**
     * Adds a component to an entity.
     * @param entityId The entity's ID.
     * @param component The component instance to add.
     */
    addComponent<T extends Component>(entityId: EntityId, component: T): void {
        const componentType = getComponentType(component.constructor as { new(...args: any[]): T });
        let store = this.componentStores[componentType];
        if (!store) {
            store = new ComponentStore<T>();
            this.componentStores[componentType] = store;
        }
        // Get a component instance from the pool or create a new one
        const componentInstance = store.getOrCreate(component.constructor as { new(...args: any[]): T });
        // Copy data from the provided component to the pooled/new instance
        Object.assign(componentInstance, component);
        store.add(entityId, componentInstance);

        // If it's a PositionComponent, add to spatial grid
        if (componentInstance instanceof PositionComponent) {
            const pos = componentInstance as PositionComponent;
            this.spatialGrid.add(entityId, pos.x, pos.y, pos.z);
        }
    }

    /**
     * Retrieves a component from an entity.
     * @param entityId The entity's ID.
     * @param componentClass The class of the component to retrieve.
     * @returns The component instance, or undefined if not found.
     */
    getComponent<T extends Component>(entityId: EntityId, componentClass: { new(...args: any[]): T }): T | undefined {
        const componentType = getComponentType(componentClass);
        const store = this.componentStores[componentType];
        return store ? store.get(entityId) : undefined;
    }

    /**
     * Checks if an entity has a specific component.
     * @param entityId The entity's ID.
     * @param componentClass The class of the component to check for.
     * @returns True if the entity has the component, false otherwise.
     */
    hasComponent<T extends Component>(entityId: EntityId, componentClass: { new(...args: any[]): T }): boolean {
        const componentType = getComponentType(componentClass);
        const store = this.componentStores[componentType];
        return store ? store.has(entityId) : false;
    }

    /**
     * Removes a component from an entity.
     * @param entityId The entity's ID.
     * @param componentClass The class of the component to remove.
     */
    removeComponent<T extends Component>(entityId: EntityId, componentClass: { new(...args: any[]): T }): void {
        const componentType = getComponentType(componentClass);
        const store = this.componentStores[componentType];
        if (store) {
            // If it's a PositionComponent, remove from spatial grid
            const component = store.get(entityId);
            if (component instanceof PositionComponent) {
                const pos = component as PositionComponent;
                if (pos) { // Ensure component exists before trying to remove from grid
                    this.spatialGrid.remove(entityId, pos.x, pos.y, pos.z);
                }
            }
            store.remove(entityId);
        }
    }

    /**
     * Registers a system to be executed by the world's update loop.
     * @param system The system instance to register.
     */
    registerSystem(system: System): void {
        this.systems.push(system);
    }

    /**
     * The main game loop. Executes the update method of all registered systems.
     * @param deltaTime The time in seconds since the last update.
     */
    update(deltaTime: number): void {
        if (!this.isMonitoringEnabled) {
            // Standard execution loop
            for (const system of this.systems) {
                system.update(deltaTime);
            }
        } else {
            // Monitored execution loop
            for (const system of this.systems) {
                const startTime = Date.now();
                system.update(deltaTime);
                const endTime = Date.now();
                const executionTime = endTime - startTime;
                const systemName = system.constructor.name;
                this.performanceMetrics.set(systemName, executionTime);
            }
        }
        // Process all queued events after systems have updated.
        (this.eventBus as any).processQueue(); // Cast to any because EventBus doesn't have processQueue, NetworkEventBus does.
    }

    /**
     * Queries for entities that have a specific set of components.
     * This is a core performance function, optimized to iterate over the smallest possible set of entities.
     * @param components An array of component classes to query for.
     * @returns An array of EntityIds that match the query.
     */
    query(components: { new(...args: any[]): Component }[]): EntityId[];
    /**
     * Queries for entities within a specific radius, optionally filtering by components.
     * @param x The X coordinate of the query center.
     * @param y The Y coordinate of the query center.
     * @param z The Z coordinate of the query center.
     * @param radius The radius of the query sphere.
     * @param components Optional: An array of component classes to further filter the results.
     * @returns An array of EntityIds that match the spatial and component query.
     */
    query(x: number, y: number, z: number, radius: number, components?: { new(...args: any[]): Component }[]): EntityId[];
    query(...args: any[]): EntityId[] {
        if (typeof args[0] === 'number' && args.length >= 4) {
            // Spatial query
            const [x, y, z, radius, filterComponents] = args;
            const spatialResults = this.spatialGrid.query(x, y, z, radius);

            if (!filterComponents || filterComponents.length === 0) {
                return spatialResults;
            }
            // Further filter spatial results by components
            const filteredResults: EntityId[] = [];
            for (const entityId of spatialResults) {
                let hasAllComponents = true;
                for (const compClass of filterComponents) {
                    if (!this.hasComponent(entityId, compClass)) {
                        hasAllComponents = false;
                        break;
                    }
                }
                if (hasAllComponents) {
                    filteredResults.push(entityId);
                }
            }
            return filteredResults;
        } else if (Array.isArray(args[0])) {
            // Component-based query (original implementation)
            const components = args[0] as { new(...args: any[]): Component }[];
            const stores = components.map(c => this.componentStores[getComponentType(c)]).filter(s => s !== undefined) as ComponentStore<any>[];

            // If any component type doesn't exist, no entities can match.
            if (stores.length !== components.length) {
                return [];
            }

            // For performance, sort stores by size to iterate over the smallest one first.
            stores.sort((a, b) => a.getEntitiesCount() - b.getEntitiesCount());

            const smallestStore = stores[0];
            const otherStores = stores.slice(1);
            const result: EntityId[] = [];

            for (const entityId of smallestStore.getEntities()) {
                let match = true;
                for (const store of otherStores) {
                    if (!store.has(entityId)) {
                        match = false;
                        break;
                    }
                }
                if (match) {
                    result.push(entityId);
                }
            }
            return result;
        }
        return []; // Should not happen
    }

    // --- Performance Monitoring Methods ---

    /**
     * Enables performance monitoring for all registered systems.
     */
    public enablePerformanceMonitoring(): void {
        this.isMonitoringEnabled = true;
        console.log('[World] Performance monitoring enabled.');
    }

    /**
     * Disables performance monitoring.
     */
    public disablePerformanceMonitoring(): void {
        this.isMonitoringEnabled = false;
        this.performanceMetrics.clear();
        console.log('[World] Performance monitoring disabled.');
    }

    /**
     * Gets the latest performance metrics for all systems.
     * @returns A Map where the key is the system name and the value is the execution time in milliseconds.
     */
    public getPerformanceMetrics(): ReadonlyMap<string, number> {
        return this.performanceMetrics;
    }

    // --- Debugging Methods ---

    /**
     * Gathers and returns a snapshot of an entity's current state for debugging.
     * @param entityId The ID of the entity to inspect.
     * @returns An object containing the entity's ID and a list of its components and their data.
     */
    public getEntityState(entityId: EntityId): object | null {
        let hasAnyComponent = false;
        const entityState: { entityId: EntityId, components: { [componentName: string]: any } } = {
            entityId,
            components: {},
        };

        for (let i = 0; i < this.componentStores.length; i++) {
            const store = this.componentStores[i];
            if (store && store.has(entityId)) {
                hasAnyComponent = true;
                const component = store.get(entityId);
                const componentName = getComponentName(i);
                entityState.components[componentName] = component;
            }
        }

        return hasAnyComponent ? entityState : null;
    }

    /**
     * Updates the position of an entity's PositionComponent in the spatial grid.
     * This method should be called when an entity's position changes.
     * @param entityId The ID of the entity.
     * @param oldX The old X coordinate.
     * @param oldY The old Y coordinate.
     * @param oldZ The old Z coordinate.
     * @param newX The new X coordinate.
     * @param newY The new Y coordinate.
     * @param newZ The new Z coordinate.
     */
    public updateComponentPosition(entityId: EntityId, oldX: number, oldY: number, oldZ: number, newX: number, newY: number, newZ: number): void {
        this.spatialGrid.update(entityId, oldX, oldY, oldZ, newX, newY, newZ);
    }
}
