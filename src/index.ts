import { World } from './core/World';
import { ModuleManager } from './services/ModuleManager';
import { ChatModule } from '../examples/chat/ChatModule';
import { EconomyModule } from '../examples/economy/EconomyModule';
import { MinigameModule } from '../examples/minigame/MinigameModule';
import { BatchMovementSystem } from '../examples/chat/BatchMovementSystem';
import { PlayerConnectionSystem } from './services/PlayerConnectionSystem';
import { BatchMovementSystem } from '../examples/chat/BatchMovementSystem';

// Initialize the World for the server-side immediately
const serverWorld = new World();

// Initialize ModuleManager and load example modules
const moduleManager = new ModuleManager(serverWorld.diContainer);
serverWorld.diContainer.register(ModuleManager, moduleManager); // Register ModuleManager itself

// Load example modules
moduleManager.loadModule(() => new ChatModule());
moduleManager.loadModule(() => new EconomyModule());
moduleManager.loadModule(() => new MinigameModule());

// Register core systems
serverWorld.registerSystem(new PlayerConnectionSystem(serverWorld));
serverWorld.registerSystem(new BatchMovementSystem(serverWorld)); // Register BatchMovementSystem

console.log('[FRAMEWORK] Server-side World and Modules Initialized.');