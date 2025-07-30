import { World } from './core/World';
import { DIContainer } from './services/DIContainer';
import { ModuleManager } from './services/ModuleManager';
import { ChatModule } from '../examples/chat/ChatModule';
import { EconomyModule } from '../examples/economy/EconomyModule';
import { MinigameModule } from '../examples/minigame/MinigameModule';

// Initialize DIContainer first
const diContainer = new DIContainer();

// Register DIContainer itself
diContainer.register(DIContainer, diContainer);

// Initialize the World and register it
const clientWorld = new World();
diContainer.register(World, clientWorld);

// Initialize ModuleManager and register it
const moduleManager = new ModuleManager(diContainer);
diContainer.register(ModuleManager, moduleManager);

// Load example modules (only client-side relevant ones)
// For simplicity, loading all example modules here, but in a real scenario,
// you'd load only client-side specific modules or parts of them.
moduleManager.loadModule(() => new ChatModule());
moduleManager.loadModule(() => new EconomyModule());
moduleManager.loadModule(() => new MinigameModule());

console.log('[FRAMEWORK] Client-side World and Modules Initialized.');
