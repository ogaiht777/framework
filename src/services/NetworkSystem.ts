
import { System } from '../core/System';
import { World } from '../core/World';
import { NetworkComponent } from '../core/components/NetworkComponent';
import { Component } from '../core/Component';
import { ISerializer, JsonSerializer } from './Serializer';
import { EntityId } from '../core/Entity';

// In a real scenario, you would have more components that are network-aware
// For example, PositionComponent, HealthComponent, etc.

/**
 * A system responsible for synchronizing entity states across the network.
 */
export class NetworkSystem extends System {
    public requiredComponents = [NetworkComponent];

    private syncRate = 1 / 10; // Sync 10 times per second
    private syncTimer = 0;
    private serializer: ISerializer;

    constructor(world: World) {
        super(world);
        this.serializer = new JsonSerializer();
        // Subscribe to incoming network state synchronization events
        (this.world.eventBus as any).subscribeNet('entityStateSync', this.handleEntityStateSync.bind(this));
    }

    update(deltaTime: number): void {
        this.syncTimer += deltaTime;

        // Only run the synchronization logic at the specified rate
        if (this.syncTimer < this.syncRate) {
            return;
        }

        this.syncTimer = 0;

        const networkedEntities = this.world.query(this.requiredComponents);

        for (const entityId of networkedEntities) {
            const networkComp = this.world.getComponent(entityId, NetworkComponent)!;

            // This is where you would gather all other relevant components
            // (e.g., Position, Rotation, Health) to build a state packet.
            const statePayload = {
                networkId: networkComp.networkId,
                owner: networkComp.owner,
                // Example: position: this.world.getComponent(entityId, PositionComponent)
            };

            // Serialize and send the state across the network
            const serializedPayload = this.serializer.serialize(statePayload);
            (this.world.eventBus as any).publishNet('entityStateSync', serializedPayload);
        }
    }

    /**
     * Handles incoming synchronized entity states from the network.
     * @param serializedState The serialized state received from the network.
     */
    private handleEntityStateSync(serializedState: any): void {
        const deserializedState = this.serializer.deserialize(serializedState);
        console.log(`[NetworkSystem] Received and deserialized state:`, deserializedState);

        // TODO: Implement logic to find the local entity based on networkId
        // and update its components with the received state.
        // This would involve mapping networkId to local EntityId and then
        // calling world.addComponent or world.getComponent/update for each relevant component.
    }

    processBatch(entityIds: EntityId[], world: World): void {
        // This system does not process entities in batches.
    }
}
