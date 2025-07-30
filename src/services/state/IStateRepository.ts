
/**
 * Defines the contract for a state repository.
 * A state repository is the single source of truth for a specific piece of state (e.g., player data).
 * It handles loading state from a persistent source (like a database) and keeping it in memory for fast access.
 * @template T The type of the state object.
 * @template K The type of the key used to identify the state (e.g., number for player ID).
 */
export interface IStateRepository<T, K> {
    /**
     * Loads the state for a given key from the persistent store into memory.
     * @param key The unique identifier for the state.
     * @returns A promise that resolves with the state object, or null if not found.
     */
    load(key: K): Promise<T | null>;

    /**
     * Retrieves the current state from memory.
     * @param key The unique identifier for the state.
     * @returns The state object, or null if not loaded.
     */
    get(key: K): T | null;

    /**
     * Updates the state in memory.
     * This typically marks the state as "dirty" to be saved later.
     * @param key The unique identifier for the state.
     * @param state The new state object or a part of it.
     */
    update(key: K, state: Partial<T>): void;

    /**
     * Saves the current state from memory to the persistent store.
     * @param key The unique identifier for the state.
     * @returns A promise that resolves when the save operation is complete.
     */
    save(key: K): Promise<void>;

    /**
     * Deletes the state from memory and/or the persistent store.
     * @param key The unique identifier for the state.
     * @returns A promise that resolves when the delete operation is complete.
     */
    delete(key: K): Promise<void>;
}
