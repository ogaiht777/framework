
import { DIContainer } from '../services/DIContainer';

/**
 * Defines the contract for a module.
 * A module is a self-contained unit of functionality (e.g., chat, economy).
 */
export interface IModule {
    /**
     * A unique name for the module.
     */
    readonly name: string;

    /**
     * Called when the module is loaded.
     * Use this to register services, systems, and event listeners.
     * @param container The global DI container to register/resolve services.
     */
    initialize(container: DIContainer): void;

    /**
     * Called when the module is about to be unloaded.
     * Use this for cleanup, such as unsubscribing from events.
     */
    destroy?(): void;
}
