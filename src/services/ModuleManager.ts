
import { IModule } from '../core/IModule';
import { DIContainer } from './DIContainer';

/**
 * Manages the lifecycle of modules.
 * It is responsible for loading, initializing, and unloading modules.
 */
export class ModuleManager {
    private modules = new Map<string, IModule>();
    private moduleFactories = new Map<string, () => IModule>();

    constructor(private container: DIContainer) {}

    /**
     * Loads and initializes a module from its factory.
     * @param moduleFactory A function that returns an instance of the module to load.
     */
    loadModule(moduleFactory: () => IModule): void {
        const moduleInstance = moduleFactory();
        const moduleName = moduleInstance.name;

        if (this.modules.has(moduleName)) {
            console.warn(`[ModuleManager] Module "${moduleName}" is already loaded.`);
            return;
        }

        try {
            console.log(`[ModuleManager] Initializing module: ${moduleName}`);
            moduleInstance.initialize(this.container);
            this.modules.set(moduleName, moduleInstance);
            this.moduleFactories.set(moduleName, moduleFactory);
        } catch (error) {
            console.error(`[ModuleManager] Failed to initialize module "${moduleName}"`, error);
        }
    }

    /**
     * Unloads a module and calls its destroy method if it exists.
     * @param moduleName The name of the module to unload.
     */
    unloadModule(moduleName: string): void {
        const module = this.modules.get(moduleName);
        if (!module) {
            console.warn(`[ModuleManager] Module "${moduleName}" not found.`);
            return;
        }

        if (module.destroy) {
            try {
                console.log(`[ModuleManager] Destroying module: ${module.name}`);
                module.destroy();
            } catch (error) {
                console.error(`[ModuleManager] Failed to destroy module "${module.name}"`, error);
            }
        }

        this.modules.delete(moduleName);
        // Keep the factory for potential hot-reloading
    }

    /**
     * Reloads a module by unloading it and then loading a new instance from its factory.
     * @param moduleName The name of the module to reload.
     */
    reloadModule(moduleName: string): void {
        const moduleFactory = this.moduleFactories.get(moduleName);
        if (!moduleFactory) {
            console.warn(`[ModuleManager] Module factory for "${moduleName}" not found. Cannot reload.`);
            return;
        }

        console.log(`[ModuleManager] Reloading module: ${moduleName}`);
        this.unloadModule(moduleName);
        this.loadModule(moduleFactory);
    }

    /**
     * Unloads all loaded modules.
     */
    unloadAllModules(): void {
        for (const moduleName of this.modules.keys()) {
            this.unloadModule(moduleName);
        }
        this.moduleFactories.clear(); // Clear factories when all modules are unloaded
    }
}
