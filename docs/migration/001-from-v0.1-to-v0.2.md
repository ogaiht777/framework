# 001-from-v0.1-to-v0.2.md

# Migrating from v0.1 to v0.2

This guide outlines the necessary steps to migrate your project from FiveM ECS Framework v0.1 to v0.2.

## Breaking Changes

*   **System.ts**: The `System` abstract class now includes a new abstract method `processBatch(entityIds: EntityId[], world: World): void`. All custom systems extending `System` must implement this method. If your system does not require batch processing, you can provide an empty implementation.

    **Before (v0.1):**
    ```typescript
    export class MySystem extends System {
        // ...
        update(deltaTime: number): void { /* ... */ }
    }
    ```

    **After (v0.2):**
    ```typescript
    import { EntityId } from '@fivem-ecs/core'; // Assuming a package import

    export class MySystem extends System {
        // ...
        update(deltaTime: number): void { /* ... */ }
        processBatch(entityIds: EntityId[], world: World): void { /* ... */ }
    }
    ```

*   **World.ts Constructor**: The `World` constructor now requires passing its own instance to `SimpleSpatialGrid`. If you are manually instantiating `World`, ensure you update the constructor call.

    **Before (v0.1):**
    ```typescript
    const world = new World();
    ```

    **After (v0.2):**
    ```typescript
    const world = new World(); // The SimpleSpatialGrid is now initialized with `this` inside World's constructor.
    ```

## New Features

*   **Spatial Partitioning**: The `World` class now integrates `ISpatialGrid` and `SimpleSpatialGrid` for optimized spatial queries. Entities with `PositionComponent` are automatically added/removed/updated in the spatial grid.
*   **Batch Processing Systems**: The `System` class now includes a `processBatch` method, allowing for more efficient processing of entities in batches.
*   **Memory Profiling Tools**: A new `MemoryProfilerService` is available via `DIContainer` to help monitor and analyze memory usage.
*   **Server-side Validation Framework**: The `ValidationService` provides a generic way to define and apply validation rules to data.
*   **Anti-cheat Integration Points**: The `AntiCheatService` offers a centralized point for reporting and subscribing to suspicious activities.
*   **Rate Limiting System**: The `RateLimitingService` allows defining and enforcing rate limits on various actions.
*   **Input Sanitization**: The `InputSanitizationService` provides methods to clean and sanitize user input.

## Deprecations

*   None in this version.

## How to Upgrade

1.  **Update Framework Package**: Update your `fivem-ecs-framework` package to the latest version (v0.2.x).
2.  **Implement `processBatch`**: For all your custom systems extending `System`, add the `processBatch` method.
3.  **Review `World` Instantiation**: If you manually instantiate `World`, ensure it aligns with the new constructor signature (though this was handled internally).
4.  **Review Imports**: Ensure all necessary imports (e.g., `EntityId` in systems) are present.

