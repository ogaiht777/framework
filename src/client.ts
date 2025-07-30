import { World } from './core/World';
import { ModuleManager } from './services/ModuleManager';
import { ChatModule } from '../examples/chat/ChatModule';
import { EconomyModule } from '../examples/economy/EconomyModule';
import { MinigameModule } from '../examples/minigame/MinigameModule';

// Initialize the World for the client-side immediately
const clientWorld = new World();

// Initialize ModuleManager and load example modules (client-side relevant ones)
const moduleManager = new ModuleManager(clientWorld.diContainer);
clientWorld.diContainer.register(ModuleManager, moduleManager);

// Load example modules (only client-side parts if applicable)
// For simplicity, loading all example modules here, but in a real scenario,
// you'd load only client-side specific modules or parts of them.
moduleManager.loadModule(() => new ChatModule());
moduleManager.loadModule(() => new EconomyModule());
moduleManager.loadModule(() => new MinigameModule());

console.log('[FRAMEWORK] Client-side World and Modules Initialized.');
