import { System } from '../../src/core/System';
import { World } from '../../src/core/World';
import { EntityId } from '../../src/core/Entity';
import { PositionComponent } from '../../src/core/components/PositionComponent';

export class BatchMovementSystem extends System {
    constructor(world: World) {
        super(world);
        this.requiredComponents = [PositionComponent];
    }

    update(deltaTime: number): void {
        // This system will primarily use processBatch, so update can be empty or trigger batch processing.
        // For demonstration, we'll call processBatch directly here.
        const entitiesToProcess = this.world.query([PositionComponent]);
        if (entitiesToProcess.length > 0) {
            this.processBatch(entitiesToProcess, this.world);
        }
    }

    processBatch(entityIds: EntityId[], world: World): void {
        for (const entityId of entityIds) {
            const position = world.getComponent(entityId, PositionComponent);
            if (position) {
                const oldX = position.x;
                const oldY = position.y;
                const oldZ = position.z;

                position.x += 1; // Move 1 unit per update (not per second, for simplicity in batch)

                world.updateComponentPosition(entityId, oldX, oldY, oldZ, position.x, position.y, position.z);
            }
        }
    }
}
