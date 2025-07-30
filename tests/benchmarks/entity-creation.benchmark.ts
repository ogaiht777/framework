import { World } from '../../src/core/World';
import { PositionComponent } from '../../src/core/components/PositionComponent';

// Simple benchmarking utility (for demonstration purposes)
function benchmark(name: string, fn: () => void, iterations: number = 10000): void {
    const start = process.hrtime.bigint();
    for (let i = 0; i < iterations; i++) {
        fn();
    }
    const end = process.hrtime.bigint();
    const durationNs = Number(end - start);
    const durationMs = durationNs / 1_000_000;
    console.log(`Benchmark: ${name} - ${durationMs.toFixed(3)} ms for ${iterations} iterations (${(durationMs / iterations).toFixed(6)} ms/op)`);
}

// --- Benchmarks ---

console.log('\n--- Running Performance Benchmarks ---');

// Benchmark: Entity Creation
const world = new World();
benchmark('Entity Creation', () => {
    const entity = world.createEntity();
    world.destroyEntity(entity.id);
}, 100000); // 100,000 entity creations and destructions

// Benchmark: Add/Get/Remove Component
const entityWithComp = world.createEntity();
benchmark('Add/Get/Remove Component', () => {
    world.addComponent(entityWithComp.id, new PositionComponent(1, 2, 3));
    world.getComponent(entityWithComp.id, PositionComponent);
    world.removeComponent(entityWithComp.id, PositionComponent);
}, 100000); // 100,000 add/get/remove operations

// Benchmark: Query Entities (simple)
const queryWorld = new World();
for (let i = 0; i < 1000; i++) {
    const entity = queryWorld.createEntity();
    queryWorld.addComponent(entity.id, new PositionComponent(i, i, i));
}
benchmark('Query Entities (1000 entities)', () => {
    queryWorld.query([PositionComponent]);
}, 1000); // 1,000 queries

console.log('--- Benchmarks Finished ---\n');
