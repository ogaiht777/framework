
import { EventBus, EventHandler, EventPriority } from './EventBus';

// Declare FiveM global functions to avoid TypeScript errors.
// These will be available in the FiveM runtime environment.
declare function TriggerClientEvent(eventName: string, targetSource: number | string, ...args: any[]): void;
declare function TriggerServerEvent(eventName: string, ...args: any[]): void;
declare function onNet(eventName: string, handler: Function): void;
declare function GetCurrentResourceName(): string;

/**
 * Extends the EventBus to provide client-server event bridging for FiveM.
 * It allows events to be sent and received across the network.
 */
export class NetworkEventBus extends EventBus {
    private readonly NETWORK_EVENT_PREFIX = 'net:';

    constructor() {
        super();
        this.setupNetworkListeners();
    }

    /**
     * Sets up global FiveM network event listeners.
     * This method should be called once, typically during framework initialization.
     */
    private setupNetworkListeners(): void {
        // Listen for all incoming network events that start with our prefix
        onNet(this.NETWORK_EVENT_PREFIX + '*' as any, (eventName: string, ...args: any[]) => {
            // Extract the original event name by removing the prefix
            const originalEventName = eventName.substring(this.NETWORK_EVENT_PREFIX.length);
            // Network events are often critical, so give them HIGH priority by default.
            this.publishWithPriority(originalEventName, EventPriority.HIGH, ...args);
        });
        console.log('[NetworkEventBus] Network listeners set up.');
    }

    /**
     * Publishes an event locally and also sends it across the network.
     * The event name will be prefixed for network transmission.
     * @param eventName The name of the event to publish and send.
     * @param args The arguments to pass to the handlers.
     */
    public publishNet(eventName: string, ...args: any[]): void;
    public publishNet(eventName: string, priority: EventPriority, ...args: any[]): void;
    public publishNet(eventName: string, ...args: any[]): void {
        let priority: EventPriority = EventPriority.MEDIUM;
        let eventArgs: any[] = args;

        if (typeof args[0] === 'number' && args[0] in EventPriority) {
            priority = args[0];
            eventArgs = args.slice(1);
        }

        // Publish locally first with specified priority
        this.publishWithPriority(eventName, priority, ...eventArgs);

        // Then send across the network
        const netEventName = this.NETWORK_EVENT_PREFIX + eventName;

        // Determine if we are on the server or client side
        if (typeof TriggerClientEvent !== 'undefined') {
            // We are on the server, send to all clients
            TriggerClientEvent(netEventName, -1, ...eventArgs); // -1 means all clients
        } else if (typeof TriggerServerEvent !== 'undefined') {
            // We are on the client, send to server
            TriggerServerEvent(netEventName, ...eventArgs);
        } else {
            console.warn(`[NetworkEventBus] Cannot send network event ${netEventName}: Not in FiveM environment.`);
        }
    }

    /**
     * Subscribes a handler function to a network event.
     * This is essentially a local subscription, but it's meant for events that are also networked.
     * @param eventName The name of the network event to subscribe to.
     * @param handler The function to call when the network event is published.
     */
    public subscribeNet(eventName: string, handler: EventHandler): void {
        this.subscribe(eventName, handler);
    }

    /**
     * Unsubscribes a handler function from a network event.
     * @param eventName The name of the network event to unsubscribe from.
     * @param handler The handler function to remove.
     */
    public unsubscribeNet(eventName: string, handler: EventHandler): void {
        this.unsubscribe(eventName, handler);
    }
}
