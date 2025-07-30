
// Defines the shape of a function that can handle an event.
// Using `any[]` for arguments to keep it flexible, but specific event types can be defined elsewhere.
export type EventHandler = (...args: any[]) => void;

/**
 * Defines the priority of an event.
 */
export enum EventPriority {
    LOW = 0,
    MEDIUM = 1,
    HIGH = 2,
    CRITICAL = 3,
}

/**
 * Represents an event that is queued for processing.
 */
interface QueuedEvent {
    name: string;
    args: any[];
    priority: EventPriority;
}

/**
 * A decoupled communication system for the framework.
 * It allows different parts of the code to interact without having direct references to each other.
 * This is highly efficient due to the use of Map and Set for O(1) lookups.
 */
export class EventBus {
    // A Map where keys are event names (strings) and values are Sets of handler functions.
    // Using a Set for handlers automatically prevents duplicate subscriptions.
    private listeners: Map<string, Set<EventHandler>> = new Map();
    private eventQueue: QueuedEvent[] = [];

    /**
     * Subscribes a handler function to a specific event.
     * @param eventName The name of the event to subscribe to.
     * @param handler The function to call when the event is published.
     */
    subscribe(eventName: string, handler: EventHandler): void {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, new Set());
        }
        this.listeners.get(eventName)!.add(handler);
    }

    /**
     * Unsubscribes a handler function from a specific event.
     * @param eventName The name of the event to unsubscribe from.
     * @param handler The handler function to remove.
     */
    unsubscribe(eventName: string, handler: EventHandler): void {
        const handlers = this.listeners.get(eventName);
        if (handlers) {
            handlers.delete(handler);
        }
    }

    /**
     * Publishes an event, adding it to the queue for processing.
     * Default priority is MEDIUM.
     * @param eventName The name of the event to publish.
     * @param args The arguments to pass to the handlers.
     */
    publish(eventName: string, ...args: any[]): void {
        this.publishWithPriority(eventName, EventPriority.MEDIUM, ...args);
    }

    /**
     * Publishes an event with a specific priority, adding it to the queue for processing.
     * @param eventName The name of the event to publish.
     * @param priority The priority of the event.
     * @param args The arguments to pass to the handlers.
     */
    publishWithPriority(eventName: string, priority: EventPriority, ...args: any[]): void {
        this.eventQueue.push({ name: eventName, args, priority });
    }

    /**
     * Processes all events currently in the queue.
     * Events are processed in order of priority (CRITICAL > HIGH > MEDIUM > LOW).
     */
    processQueue(): void {
        // Sort events by priority (higher priority first)
        this.eventQueue.sort((a, b) => b.priority - a.priority);

        for (const event of this.eventQueue) {
            const handlers = this.listeners.get(event.name);
            if (handlers) {
                // Iterate over a copy of the set in case a handler unsubscribes itself during execution
                for (const handler of [...handlers]) {
                    handler(...event.args);
                }
            }
        }
        // Clear the queue after processing
        this.eventQueue = [];
    }
}
