import { IModule } from '../../src/core/IModule';
import { DIContainer } from '../../src/services/DIContainer';
import { World } from '../../src/core/World';
import { System } from '../../src/core/System';
import { EntityId } from '../../src/core/Entity';
import { Component } from '../../src/core/Component';

// --- Components for the Mini-game ---

export class PlayerComponent implements Component {
    constructor(public score: number = 0) {}
}

export class TargetComponent implements Component {
    constructor(public value: number = 10) {}
}

export class PositionComponent implements Component {
    constructor(public x: number = 0, public y: number = 0, public z: number = 0) {}
}

// --- Systems for the Mini-game ---

class MovementSystem extends System {
    public requiredComponents = [PositionComponent];

    update(deltaTime: number): void {
        const entities = this.world.query(this.requiredComponents);
        for (const entityId of entities) {
            const position = this.world.getComponent(entityId, PositionComponent)!;
            // Simple movement: move towards a target or randomly
            position.x += Math.sin(deltaTime * 10) * 0.1; // Example: oscillating movement
            position.y += Math.cos(deltaTime * 10) * 0.1;
        }
    }

    processBatch(entityIds: EntityId[], world: World): void {
        // Not used in this simple example, but required by abstract System class
    }
}

class TargetCollectionSystem extends System {
    public requiredComponents = [PlayerComponent, PositionComponent];

    update(deltaTime: number): void {
        const players = this.world.query([PlayerComponent, PositionComponent]);
        const targets = this.world.query([TargetComponent, PositionComponent]);

        for (const playerId of players) {
            const playerPos = this.world.getComponent(playerId, PositionComponent)!;
            const playerComp = this.world.getComponent(playerId, PlayerComponent)!;

            for (const targetId of targets) {
                const targetPos = this.world.getComponent(targetId, PositionComponent)!;
                const targetComp = this.world.getComponent(targetId, TargetComponent)!;

                // Simple collision detection (distance-based)
                const distance = Math.sqrt(
                    Math.pow(playerPos.x - targetPos.x, 2) +
                    Math.pow(playerPos.y - targetPos.y, 2) +
                    Math.pow(playerPos.z - targetPos.z, 2)
                );

                if (distance < 1.0) { // If player is close enough to target
                    playerComp.score += targetComp.value;
                    console.log(`[Minigame] Player ${playerId} collected target ${targetId}. Score: ${playerComp.score}`);
                    this.world.destroyEntity(targetId); // Remove collected target

                    // Create a new target for continuous gameplay
                    const newTarget = this.world.createEntity();
                    this.world.addComponent(newTarget.id, new TargetComponent());
                    this.world.addComponent(newTarget.id, new PositionComponent(Math.random() * 10 - 5, Math.random() * 10 - 5, 0));
                }
            }
        }
    }

    processBatch(entityIds: EntityId[], world: World): void {
        // Not used in this simple example
    }
}

// --- Mini-game Module ---

export class MinigameModule implements IModule {
    public readonly name = 'Minigame';

    initialize(container: DIContainer): void {
        console.log(`[MinigameModule] Initializing...`);

        const world = container.resolve<World>(World);

        // Register components (if not already registered by core)
        // Note: PositionComponent is already in core, so no need to re-register.
        // world.registerComponent(PlayerComponent); // Example if ComponentStore was public
        // world.registerComponent(TargetComponent);

        // Register systems
        world.registerSystem(new MovementSystem(world));
        world.registerSystem(new TargetCollectionSystem(world));

        // Create initial entities
        const playerEntity = world.createEntity();
        world.addComponent(playerEntity.id, new PlayerComponent());
        world.addComponent(playerEntity.id, new PositionComponent(0, 0, 0));

        const initialTarget = world.createEntity();
        world.addComponent(initialTarget.id, new TargetComponent());
        world.addComponent(initialTarget.id, new PositionComponent(2, 2, 0));

        console.log(`[MinigameModule] Initialized. Player: ${playerEntity.id}, Target: ${initialTarget.id}`);
    }

    destroy?(): void {
        console.log(`[MinigameModule] Destroying...`);
        // Cleanup entities, systems, etc.
    }
}
