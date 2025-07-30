import { World } from '../../src/core/World';
import { System } from '../../src/core/System';
import { EntityId } from '../../src/core/Entity';
import { PositionComponent } from '../../src/core/components/PositionComponent';

// --- Stress Test Configuration ---
const NUM_ENTITIES = 10000; // Number of entities to create
const NUM_SYSTEMS = 5;    // Number of dummy systems to register
const UPDATE_ITERATIONS = 100; // Number of update cycles to run

// --- Dummy Components and Systems for Stress Test ---

class DummyComponent implements Component {
    constructor(public value: number = 0) {}
}

class DummySystem extends System {
    public requiredComponents = [PositionComponent, DummyComponent];

    update(deltaTime: number): void {
        const entities = this.world.query(this.requiredComponents);
        for (const entityId of entities) {
            const pos = this.world.getComponent(entityId, PositionComponent)!;
            const dummy = this.world.getComponent(entityId, DummyComponent)!;

            // Simulate some work
            pos.x += 0.01 * deltaTime;
            dummy.value = Math.sin(pos.x);
        }
    }

    processBatch(entityIds: EntityId[], world: World): void {
        // Simulate some batch work
        for (const entityId of entityIds) {
            const dummy = world.getComponent(entityId, DummyComponent)!;
            dummy.value *= 1.01; // Increase value slightly
        }
    }
}

// --- Stress Test Logic ---

console.log('\n--- Running Performance Stress Test ---');
console.log(`Simulating with ${NUM_ENTITIES} entities and ${NUM_SYSTEMS} systems for ${UPDATE_ITERATIONS} update cycles.`);

const world = new World();

// Register dummy systems
for (let i = 0; i < NUM_SYSTEMS; i++) {
    world.registerSystem(new DummySystem(world));
}

// Create entities with components
for (let i = 0; i < NUM_ENTITIES; i++) {
    const entity = world.createEntity();
    world.addComponent(entity.id, new PositionComponent(Math.random() * 100, Math.random() * 100, Math.random() * 100));
    world.addComponent(entity.id, new DummyComponent(Math.random()));
}

// Run update cycles and measure performance
const startTime = process.hrtime.bigint();

for (let i = 0; i < UPDATE_ITERATIONS; i++) {
    world.update(1 / 60); // Simulate 60 FPS update
    // Optionally, run batch processing for some systems
    // (world.systems[0] as DummySystem).processBatch(world.query([PositionComponent, DummyComponent]), world);
}

const endTime = process.hrtime.bigint();
const durationNs = Number(endTime - startTime);
const durationMs = durationNs / 1_000_000;

console.log(`Stress Test Completed in ${durationMs.toFixed(3)} ms.`);
console.log(`Average time per update cycle: ${(durationMs / UPDATE_ITERATIONS).toFixed(3)} ms.`);

// Optional: Enable performance monitoring and log metrics
world.enablePerformanceMonitoring();
world.update(1 / 60);
console.log('Performance Metrics (last update):', world.getPerformanceMetrics());

console.log('--- Stress Test Finished ---\n');