
import { IDatabase } from './IDatabase';

/**
 * Defines the contract for a database migration.
 * Each migration represents a set of changes to the database schema,
 * allowing for controlled and versioned updates.
 */
export interface IMigration {
    /**
     * A unique identifier for the migration (e.g., a timestamp).
     */
    readonly id: number;

    /**
     * A descriptive name for the migration.
     */
    readonly name: string;

    /**
     * Applies the migration changes to the database.
     * @param database The database instance to apply changes to.
     */
    up(database: IDatabase): Promise<void>;

    /**
     * Reverts the migration changes from the database.
     * @param database The database instance to revert changes from.
     */
    down(database: IDatabase): Promise<void>;
}
