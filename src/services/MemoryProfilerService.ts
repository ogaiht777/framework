import { DIContainer } from './DIContainer';

export interface MemorySnapshot {
    rss: number; // Resident Set Size - total memory allocated for the process
    heapTotal: number; // Total size of the V8 heap allocated
    heapUsed: number; // Actual memory used by your application
    external: number; // Memory used by C++ objects bound to JavaScript objects
    arrayBuffers: number; // Memory allocated for ArrayBuffer and SharedArrayBuffer
}

/**
 * Service for monitoring and profiling memory usage.
 * Provides methods to take snapshots and compare them to identify memory changes.
 */
export class MemoryProfilerService {
    private snapshots: Map<string, MemorySnapshot> = new Map();

    constructor() {
        // Register this service in the DI container if needed elsewhere
        // DIContainer.instance.register(MemoryProfilerService, this);
    }

    /**
     * Takes a snapshot of the current memory usage.
     * @param name A unique name for the snapshot.
     * @returns The taken MemorySnapshot.
     */
    public takeSnapshot(name: string): MemorySnapshot {
        if (typeof process === 'undefined' || !process.memoryUsage) {
            console.warn("Memory profiling is not available in this environment (process.memoryUsage is undefined).");
            const emptySnapshot: MemorySnapshot = { rss: 0, heapTotal: 0, heapUsed: 0, external: 0, arrayBuffers: 0 };
            this.snapshots.set(name, emptySnapshot);
            return emptySnapshot;
        }

        const snapshot = process.memoryUsage();
        this.snapshots.set(name, snapshot);
        console.log(`Memory snapshot '${name}' taken:`, snapshot);
        return snapshot;
    }

    /**
     * Retrieves a previously taken memory snapshot.
     * @param name The name of the snapshot.
     * @returns The MemorySnapshot, or undefined if not found.
     */
    public getSnapshot(name: string): MemorySnapshot | undefined {
        return this.snapshots.get(name);
    }

    /**
     * Compares two memory snapshots and returns the difference.
     * Positive values indicate memory increase, negative values indicate decrease.
     * @param snapshotName1 The name of the first snapshot.
     * @param snapshotName2 The name of the second snapshot.
     * @returns An object showing the difference in memory usage, or null if snapshots are not found.
     */
    public compareSnapshots(snapshotName1: string, snapshotName2: string): Partial<MemorySnapshot> | null {
        const snap1 = this.snapshots.get(snapshotName1);
        const snap2 = this.snapshots.get(snapshotName2);

        if (!snap1 || !snap2) {
            console.warn("One or both snapshots not found for comparison.");
            return null;
        }

        return {
            rss: snap2.rss - snap1.rss,
            heapTotal: snap2.heapTotal - snap1.heapTotal,
            heapUsed: snap2.heapUsed - snap1.heapUsed,
            external: snap2.external - snap1.external,
            arrayBuffers: snap2.arrayBuffers - snap1.arrayBuffers,
        };
    }

    /**
     * Clears all stored memory snapshots.
     */
    public clearSnapshots(): void {
        this.snapshots.clear();
        console.log("All memory snapshots cleared.");
    }
}
