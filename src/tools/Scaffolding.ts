/**
 * Provides utility functions for scaffolding (generating boilerplate code) for new ECS components, systems, and modules.
 * This helps developers quickly set up new files with the correct structure.
 */
export class Scaffolding {

    /**
     * Generates the boilerplate code for a new Component.
     * @param name The name of the component (e.g., 'PositionComponent').
     * @returns The TypeScript code for the component.
     */
    public static createComponent(name: string): string {
        return `
import { Component } from '../../src/core/Component';

export class ${name} implements Component {
    // Add your component properties here
    // Example: public x: number = 0;
    // Example: public y: number = 0;

    constructor() {
        // Initialize properties
    }
}
`;
    }

    /**
     * Generates the boilerplate code for a new System.
     * @param name The name of the system (e.g., 'MovementSystem').
     * @returns The TypeScript code for the system.
     */
    public static createSystem(name: string): string {
        return `
import { System } from '../../src/core/System';
import { World } from '../../src/core/World';
import { EntityId } from '../../src/core/Entity';
// import { SomeComponent } from '../components/SomeComponent'; // Example import

export class ${name} extends System {
    // Define components this system requires to operate on entities
    // public requiredComponents = []; // Example: [SomeComponent]

    constructor(world: World) {
        super(world);
    }

    update(deltaTime: number): void {
        // Implement your system logic here.
        // Example:
        // const entities = this.world.query(this.requiredComponents);
        // for (const entityId of entities) {
        //     const component = this.world.getComponent(entityId, SomeComponent);
        //     // ... update component data ...
        // }
    }

    processBatch(entityIds: EntityId[], world: World): void {
        // Implement batch processing logic here.
        // This method is called when entities are processed in batches.
    }
}
`;
    }

    /**
     * Generates the boilerplate code for a new Module.
     * @param name The name of the module (e.g., 'PlayerModule').
     * @returns The TypeScript code for the module.
     */
    public static createModule(name: string): string {
        return `
import { IModule } from '../../src/core/IModule';
import { DIContainer } from '../../src/services/DIContainer';
import { World } from '../../src/core/World';
// import { MySystem } from './MySystem'; // Example import

export class ${name} implements IModule {
    public readonly name = '${name.replace('Module', '')}'; // Auto-derive name

    initialize(container: DIContainer): void {
        console.log(\`[${name}] Initializing...\`);

        // Resolve core services from the container
        const world = container.resolve<World>(World);

        // Register your systems, services, etc.
        // Example: world.registerSystem(new MySystem(world));

        console.log(\`[${name}] Initialized.\`);
    }

    destroy?(): void {
        console.log(\`[${name}] Destroying...\`);
        // Perform cleanup here (e.g., unregister systems, unsubscribe from events)
    }
}
`;
    }
}