

import { World } from '../core/World';

/**
 * Provides various debugging utilities for the framework.
 * This service can be resolved from the DI container.
 */
export class DebugService {
    constructor(private world: World) {}

    /**
     * Inspects the state of a specific entity and logs its components to the console.
     * @param entityId The ID of the entity to inspect.
     */
    public inspectEntity(entityId: number): void {
        const entityState = this.world.getEntityState(entityId);
        if (entityState) {
            console.log(`\n--- Entity Debug: ID ${entityId} ---`);
            console.log(JSON.stringify(entityState, null, 2));
            console.log(`--- End Entity Debug ---\n`);
        } else {
            console.log(`[DebugService] Entity ${entityId} not found or has no components.`);
        }
    }

    /**
     * Logs the current performance metrics of all registered systems to the console.
     */
    public logPerformanceMetrics(): void {
        const metrics = this.world.getPerformanceMetrics();
        if (metrics.size > 0) {
            console.log(`\n--- System Performance Metrics (ms) ---`);
            metrics.forEach((time, systemName) => {
                console.log(`  ${systemName}: ${time.toFixed(2)}`);
            });
            console.log(`--- End Performance Metrics ---\n`);
        } else {
            console.log('[DebugService] No performance metrics available. Ensure monitoring is enabled.');
        }
    }

    /**
     * Enables performance monitoring in the World.
     */
    public enablePerformanceMonitoring(): void {
        this.world.enablePerformanceMonitoring();
    }

    /**
     * Disables performance monitoring in the World.
     */
    public disablePerformanceMonitoring(): void {
        this.world.disablePerformanceMonitoring();
    }
}

