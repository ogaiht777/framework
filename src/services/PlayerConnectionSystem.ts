
import { System } from '../core/System';
import { World } from '../core/World';
import { NetworkComponent } from '../core/components/NetworkComponent';
import { EventPriority } from './EventBus';
import { EntityId } from '../core/Entity';

// Declare FiveM global functions for player events
declare function on(eventName: string, handler: Function): void;
declare function GetPlayerName(source: number): string;

/**
 * A system responsible for managing player connections and disconnections.
 * It creates/destroys entities for players and adds/removes NetworkComponents.
 */
export class PlayerConnectionSystem extends System {
    // Maps FiveM player source IDs to ECS EntityIds
    private playerEntityMap = new Map<number, number>();

    constructor(world: World) {
        super(world);
        this.setupFiveMEvents();
    }

    private setupFiveMEvents(): void {
        // FiveM server-side event for player connection
        on('playerConnecting', (playerName: string, setKickReason: Function, deferrals: any, source: number) => {
            console.log(`[PlayerConnectionSystem] Player ${playerName} (Source: ${source}) connecting.`);

            const playerEntity = this.world.createEntity();
            this.world.addComponent(playerEntity.id, new NetworkComponent(source, source));
            this.playerEntityMap.set(source, playerEntity.id);

            // Publish an internal event for other systems to react to player connection
            (this.world.eventBus as any).publishWithPriority('player:connected', EventPriority.HIGH, playerEntity.id, source);
        });

        // FiveM server-side event for player disconnection
        on('playerDropped', (reason: string, source: number) => {
            console.log(`[PlayerConnectionSystem] Player (Source: ${source}) disconnected. Reason: ${reason}`);

            const entityId = this.playerEntityMap.get(source);
            if (entityId !== undefined) {
                this.world.destroyEntity(entityId);
                this.playerEntityMap.delete(source);
                // Publish an internal event for other systems to react to player disconnection
                (this.world.eventBus as any).publishWithPriority('player:disconnected', EventPriority.HIGH, entityId, source);
            }
        });

        console.log('[PlayerConnectionSystem] FiveM player connection listeners set up.');
    }

    // This system is event-driven, so the update loop is not needed for its core logic.
    update(deltaTime: number): void {
        // No continuous logic needed here, events handle state changes.
    }

    processBatch(entityIds: EntityId[], world: World): void {
        // This system is event-driven and does not process entities in batches.
    }

    /**
     * Retrieves the ECS EntityId for a given FiveM player source ID.
     * @param source The FiveM player source ID.
     * @returns The ECS EntityId, or undefined if not found.
     */
    public getEntityIdForPlayerSource(source: number): number | undefined {
        return this.playerEntityMap.get(source);
    }
}
