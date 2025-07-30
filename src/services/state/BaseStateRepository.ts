import { IStateRepository } from './IStateRepository';

/**
 * An abstract, base implementation of a state repository.
 * It provides in-memory caching and dirty-checking to reduce database load.
 * Concrete implementations must provide the database-specific logic.
 * @template T The type of the state object.
 * @template K The type of the key used to identify the state.
 */
export abstract class BaseStateRepository<T extends { timestamp?: number }, K> implements IStateRepository<T, K> {
    // In-memory cache for fast access.
    protected stateCache = new Map<K, T>();
    // Tracks which states have been modified and need to be saved.
    protected dirtyKeys = new Set<K>();
    // Stores snapshots of state for rollback/prediction systems.
    protected snapshots = new Map<K, T[]>(); // Added

    // Abstract methods to be implemented by concrete classes.
    protected abstract _fetchFromDb(key: K): Promise<T | null>;
    /**
     * Saves the state to the database. Implementations should consider the 'timestamp'
     * for conflict resolution (e.g., only update if the database version is older).
     */
    protected abstract _saveToDb(key: K, state: T): Promise<void>;
    protected abstract _deleteFromDb(key: K): Promise<void>;

    async load(key: K): Promise<T | null> {
        if (this.stateCache.has(key)) {
            return this.stateCache.get(key)!;
        }

        const state = await this._fetchFromDb(key);
        if (state) {
            this.stateCache.set(key, state);
        }
        return state;
    }

    get(key: K): T | null {
        return this.stateCache.get(key) || null;
    }

    update(key: K, state: Partial<T>): void {
        if (!this.stateCache.has(key)) {
            // Or you could throw an error, depending on desired behavior.
            console.warn(`[StateRepository] Update called for non-loaded state with key: ${key}`);
            return;
        }

        const currentState = this.stateCache.get(key)!;
        // Merge the partial state into the current state.
        Object.assign(currentState, state);
        // Update timestamp for conflict resolution (last-write-wins)
        currentState.timestamp = Date.now();
        this.dirtyKeys.add(key);
    }

    async save(key: K): Promise<void> {
        if (!this.dirtyKeys.has(key) || !this.stateCache.has(key)) {
            return; // Nothing to save.
        }

        const state = this.stateCache.get(key)!;
        await this._saveToDb(key, state);
        this.dirtyKeys.delete(key);
    }

    async saveAllDirty(): Promise<void> {
        const savePromises: Promise<void>[] = [];
        for (const key of this.dirtyKeys) {
            savePromises.push(this.save(key));
        }
        await Promise.all(savePromises);
    }

    async delete(key: K): Promise<void> {
        await this._deleteFromDb(key);
        this.stateCache.delete(key);
        this.dirtyKeys.delete(key);
    }

    /**
     * Merges a new state into an existing state.
     * This method can be overridden by concrete repositories to implement custom merge logic.
     * By default, it performs a shallow merge (Object.assign).
     * @param existingState The state currently in memory.
     * @param newState The new state to merge.
     * @returns The merged state.
     */
    protected mergeState(existingState: T, newState: Partial<T>): T {
        // Default: last-write-wins based on timestamp, or simply overwrite if no timestamp
        if (existingState.timestamp !== undefined && newState.timestamp !== undefined) {
            if (newState.timestamp > existingState.timestamp) {
                Object.assign(existingState, newState);
            }
        } else {
            Object.assign(existingState, newState);
        }
        return existingState;
    }

    // --- Rollback/Prediction Methods --- // Added

    /**
     * Saves a snapshot of the current state for a given key.
     * @param key The unique identifier for the state.
     */
    public saveSnapshot(key: K): void {
        const currentState = this.stateCache.get(key);
        if (currentState) {
            if (!this.snapshots.has(key)) {
                this.snapshots.set(key, []);
            }
            // Deep copy the state to ensure it's immutable
            this.snapshots.get(key)!.push(JSON.parse(JSON.stringify(currentState)));
            console.log(`[StateRepository] Snapshot saved for key: ${key}`);
        } else {
            console.warn(`[StateRepository] Cannot save snapshot: State for key ${key} not found.`);
        }
    }

    /**
     * Loads a previously saved snapshot for a given key and applies it to the current state.
     * @param key The unique identifier for the state.
     * @param index The index of the snapshot to load (0 for the first, -1 for the last).
     * @returns True if the snapshot was loaded, false otherwise.
     */
    public loadSnapshot(key: K, index: number = -1): boolean {
        const snapshotsForKey = this.snapshots.get(key);
        if (snapshotsForKey && snapshotsForKey.length > 0) {
            const snapshotIndex = index === -1 ? snapshotsForKey.length - 1 : index;
            if (snapshotIndex >= 0 && snapshotIndex < snapshotsForKey.length) {
                const snapshot = snapshotsForKey[snapshotIndex];
                this.stateCache.set(key, JSON.parse(JSON.stringify(snapshot))); // Deep copy back
                this.dirtyKeys.add(key); // Mark as dirty as state has changed
                console.log(`[StateRepository] Snapshot loaded for key: ${key}, index: ${snapshotIndex}`);
                return true;
            }
        }
        console.warn(`[StateRepository] No snapshot found for key: ${key} at index: ${index}.`);
        return false;
    }

    /**
     * Clears all saved snapshots for a given key.
     * @param key The unique identifier for the state.
     */
    public clearSnapshots(key: K): void {
        if (this.snapshots.has(key)) {
            this.snapshots.delete(key);
            console.log(`[StateRepository] Snapshots cleared for key: ${key}.`);
        }
    }
}
