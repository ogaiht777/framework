
// A token can be a string or a class constructor.
export type Token<T> = string | { new(...args: any[]): T };

/**
 * A simple yet powerful Dependency Injection (DI) container.
 * It manages service instances and allows for decoupling of components.
 * This is the foundation for the module and plugin system.
 */
export class DIContainer {
    private services = new Map<Token<any>, any>();

    /**
     * Registers a service instance with the container.
     * @param token A unique identifier for the service (e.g., a string or the class constructor).
     * @param instance The instance of the service to register.
     */
    register<T>(token: Token<T>, instance: T): void {
        if (this.services.has(token)) {
            console.warn(`[DIContainer] Service with token "${String(token)}" is already registered. Overwriting.`);
        }
        this.services.set(token, instance);
    }

    /**
     * Resolves a service instance from the container.
     * @param token The unique identifier for the service to retrieve.
     * @returns The resolved service instance.
     * @throws An error if the service is not found.
     */
    resolve<T>(token: Token<T>): T {
        const service = this.services.get(token);
        if (!service) {
            throw new Error(`[DIContainer] No service registered for token "${String(token)}"`);
        }
        return service as T;
    }

    /**
     * Checks if a service is registered with the container.
     * @param token The unique identifier for the service.
     * @returns True if the service is registered, false otherwise.
     */
    has<T>(token: Token<T>): boolean {
        return this.services.has(token);
    }
}
