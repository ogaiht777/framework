
import { IModule } from '../../src/core/IModule';
import { World } from '../../src/core/World';
import { DIContainer } from '../../src/services/DIContainer';
import { ChatSystem } from './ChatSystem';

/**
 * An example module that encapsulates the chat functionality.
 */
export class ChatModule implements IModule {
    public readonly name = 'Chat';

    public initialize(container: DIContainer): void {
        console.log('[ChatModule] Initializing...');

        // Resolve core services from the container
        const world = container.resolve<World>(World);

        // Register the system
        const chatSystem = new ChatSystem(world);
        world.registerSystem(chatSystem);

        console.log('[ChatModule] ChatSystem registered.');
    }

    public destroy(): void {
        // Here you would unregister the system and unsubscribe from events
        // to allow for clean hot-reloading.
        console.log('[ChatModule] Destroying...');
    }
}
