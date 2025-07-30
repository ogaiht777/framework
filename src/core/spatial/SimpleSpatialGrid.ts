
import { EntityId } from '../Entity';
import { ISpatialGrid } from './ISpatialGrid';
import { World } from '../World'; // Import World
import { PositionComponent } from '../components/PositionComponent'; // Import PositionComponent

/**
 * A simple spatial partitioning grid implementation.
 * It divides the 3D space into fixed-size cells and stores entities within those cells.
 * This optimizes spatial queries by reducing the number of entities to check.
 */
export class SimpleSpatialGrid implements ISpatialGrid {
    private cellSize: number;
    // Maps cell keys (e.g., "x_y_z") to a Set of EntityIds within that cell.
    private grid = new Map<string, Set<EntityId>>();
    // Maps EntityId to its current cell key for efficient updates and removals.
    private entityCellMap = new Map<EntityId, string>();
    private world: World; // Reference to the World instance

    constructor(world: World, cellSize: number = 100) {
        this.world = world;
        this.cellSize = cellSize;
    }

    /**
     * Calculates the unique string key for a given 3D cell coordinate.
     * @param x The X coordinate.
     * @param y The Y coordinate.
     * @param z The Z coordinate.
     * @returns The cell key string.
     */
    private _getCellKey(x: number, y: number, z: number): string {
        const cellX = Math.floor(x / this.cellSize);
        const cellY = Math.floor(y / this.cellSize);
        const cellZ = Math.floor(z / this.cellSize);
        return `${cellX}_${cellY}_${cellZ}`;
    }

    /**
     * Calculates the squared Euclidean distance between two 3D points.
     * Used for precise distance checks in queries.
     * @param x1 Point 1 X.
     * @param y1 Point 1 Y.
     * @param z1 Point 1 Z.
     * @param x2 Point 2 X.
     * @param y2 Point 2 Y.
     * @param z2 Point 2 Z.
     * @returns The squared distance.
     */
    private _distanceSq(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number): number {
        const dx = x1 - x2;
        const dy = y1 - y2;
        const dz = z1 - z2;
        return dx * dx + dy * dy + dz * dz;
    }

    add(entityId: EntityId, x: number, y: number, z: number): void {
        const cellKey = this._getCellKey(x, y, z);
        if (!this.grid.has(cellKey)) {
            this.grid.set(cellKey, new Set<EntityId>());
        }
        this.grid.get(cellKey)!.add(entityId);
        this.entityCellMap.set(entityId, cellKey);
    }

    remove(entityId: EntityId, x: number, y: number, z: number): void {
        const cellKey = this._getCellKey(x, y, z);
        const entitiesInCell = this.grid.get(cellKey);
        if (entitiesInCell) {
            entitiesInCell.delete(entityId);
            if (entitiesInCell.size === 0) {
                this.grid.delete(cellKey);
            }
        }
        this.entityCellMap.delete(entityId);
    }

    update(entityId: EntityId, oldX: number, oldY: number, oldZ: number, newX: number, newY: number, newZ: number): void {
        const oldCellKey = this._getCellKey(oldX, oldY, oldZ);
        const newCellKey = this._getCellKey(newX, newY, newZ);

        if (oldCellKey !== newCellKey) {
            // Remove from old cell
            const entitiesInOldCell = this.grid.get(oldCellKey);
            if (entitiesInOldCell) {
                entitiesInOldCell.delete(entityId);
                if (entitiesInOldCell.size === 0) {
                    this.grid.delete(oldCellKey);
                }
            }
            // Add to new cell
            this.add(entityId, newX, newY, newZ);
        } else {
            // Only update the entity's position within the same cell (no grid change needed)
            // The entityCellMap is already correct.
        }
    }

    query(x: number, y: number, z: number, radius: number): EntityId[] {
        const foundEntities = new Set<EntityId>();
        const radiusSq = radius * radius;

        // Calculate the range of cells to check
        const minCellX = Math.floor((x - radius) / this.cellSize);
        const maxCellX = Math.floor((x + radius) / this.cellSize);
        const minCellY = Math.floor((y - radius) / this.cellSize);
        const maxCellY = Math.floor((y + radius) / this.cellSize);
        const minCellZ = Math.floor((z - radius) / this.cellSize);
        const maxCellZ = Math.floor((z + radius) / this.cellSize);

        for (let cellX = minCellX; cellX <= maxCellX; cellX++) {
            for (let cellY = minCellY; cellY <= maxCellY; cellY++) {
                for (let cellZ = minCellZ; cellZ <= maxCellZ; cellZ++) {
                    const cellKey = `${cellX}_${cellY}_${cellZ}`;
                    const entitiesInCell = this.grid.get(cellKey);
                    if (entitiesInCell) {
                        for (const entityId of entitiesInCell) {
                            // For a simple grid, we need to retrieve the entity's actual position
                            // to perform a precise distance check. This would typically involve
                            // getting a PositionComponent from the World.
                            // For now, we'll just add all entities in the cell and assume
                            // a PositionComponent would be used in a real system.
                            // TODO: Integrate with PositionComponent for precise distance check.
                            foundEntities.add(entityId);
                        }
                    }
                }
            }
        }

        const preciseResults: EntityId[] = [];
        for (const entityId of foundEntities) {
            const positionComp = this.world.getComponent(entityId, PositionComponent);
            if (positionComp && this._distanceSq(x, y, z, positionComp.x, positionComp.y, positionComp.z) <= radiusSq) {
                preciseResults.push(entityId);
            }
        }
        return preciseResults;
    }
}
