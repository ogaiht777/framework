
import { System } from '../../src/core/System';
import { World } from '../../src/core/World';
import { PlayerChatComponent } from './components/PlayerChatComponent';

// In a real scenario, you would have a mapping from player ID to entity ID.
const playerEntityMap: { [playerId: number]: number } = {
    1: 101, // Mock: Player server ID 1 corresponds to entity ID 101
    2: 102, // Mock: Player server ID 2 corresponds to entity ID 102
};

/**
 * An example system that handles chat messages.
 */
export class ChatSystem extends System {
    constructor(world: World) {
        super(world);
        this.initialize();
    }

    private initialize(): void {
        // In a real FiveM resource, you would register a 'chatMessage' event handler here.
        // For this example, we subscribe to our custom EventBus.
        this.world.eventBus.subscribe('chat:message', this.onChatMessage.bind(this));
        console.log('[ChatSystem] Subscribed to chat:message events.');
    }

    private onChatMessage(playerId: number, message: string): void {
        console.log(`[ChatSystem] Received chat message from player ${playerId}: "${message}"`);

        const entityId = playerEntityMap[playerId];
        if (entityId === undefined) {
            console.warn(`[ChatSystem] No entity found for player ${playerId}`);
            return;
        }

        let chatComponent = this.world.getComponent(entityId, PlayerChatComponent);

        if (chatComponent) {
            chatComponent.lastMessage = message;
            chatComponent.timestamp = Date.now();
        } else {
            this.world.addComponent(entityId, new PlayerChatComponent(message));
        }

        console.log(`[ChatSystem] Updated chat component for entity ${entityId}.`);
    }

    // This system is event-driven, so the update loop is not needed for its core logic.
    update(deltaTime: number): void {}

    processBatch(entityIds: EntityId[], world: World): void {
        // This system is event-driven and does not process entities in batches.
    }
}
