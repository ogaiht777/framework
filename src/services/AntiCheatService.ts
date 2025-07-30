import { DIContainer } from './DIContainer';
import { EventBus } from './EventBus';
import { EntityId } from '../core/Entity';

export enum AntiCheatEventType {
    SPEED_HACK = 'speedHack',
    TELEPORT = 'teleport',
    INVALID_COMPONENT_VALUE = 'invalidComponentValue',
    // Add more types as needed
}

export interface AntiCheatEvent {
    type: AntiCheatEventType;
    entityId: EntityId;
    details?: any; // Specific details about the cheat
}

/**
 * Provides integration points for anti-cheat systems.
 * This service dispatches events when suspicious activities are detected,
 * allowing external anti-cheat modules to react.
 */
export class AntiCheatService {
    private eventBus: EventBus;

    constructor(eventBus: EventBus) {
        this.eventBus = eventBus;
    }

    /**
     * Reports a suspicious activity to the anti-cheat system.
     * This will dispatch an AntiCheatEvent through the EventBus.
     * @param event The AntiCheatEvent to report.
     */
    public reportSuspiciousActivity(event: AntiCheatEvent): void {
        console.warn(`[AntiCheatService] Reporting suspicious activity: ${event.type} for entity ${event.entityId}`, event.details);
        this.eventBus.publish('antiCheatEvent', event);
    }

    /**
     * Allows an anti-cheat module to subscribe to suspicious activity events.
     * @param callback The function to call when an AntiCheatEvent is dispatched.
     * @returns A function to unsubscribe.
     */
    public onSuspiciousActivity(callback: (event: AntiCheatEvent) => void): () => void {
        this.eventBus.subscribe('antiCheatEvent', callback);
        return () => this.eventBus.unsubscribe('antiCheatEvent', callback);
    }
}
