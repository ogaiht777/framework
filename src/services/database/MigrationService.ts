
import { IDatabase } from './IDatabase';
import { IMigration } from './IMigration';
import { QueryBuilder } from './QueryBuilder';

/**
 * Manages database migrations, ensuring the database schema is up-to-date.
 */
export class MigrationService {
    private readonly MIGRATIONS_TABLE = 'migrations';
    private database: IDatabase;
    private migrations: IMigration[];

    constructor(database: IDatabase, migrations: IMigration[]) {
        this.database = database;
        this.migrations = migrations.sort((a, b) => a.id - b.id); // Ensure migrations are sorted by ID
    }

    /**
     * Initializes the migration system by ensuring the migrations table exists.
     */
    public async init(): Promise<void> {
        const createTableSql = `
            CREATE TABLE IF NOT EXISTS ${this.MIGRATIONS_TABLE} (
                id BIGINT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await this.database.execute(createTableSql, []);
        console.log('[MigrationService] Migrations table ensured.');
    }

    /**
     * Retrieves a list of applied migrations from the database.
     * @returns A promise that resolves with an array of applied migration IDs.
     */
    private async getAppliedMigrations(): Promise<number[]> {
        const query = QueryBuilder.select(['id']).from(this.MIGRATIONS_TABLE).build();
        const result = await this.database.query<{ id: number }>(query);
        return result.map(row => row.id);
    }

    /**
     * Applies all pending migrations.
     */
    public async applyMigrations(): Promise<void> {
        await this.init(); // Ensure migrations table exists
        const appliedMigrations = await this.getAppliedMigrations();

        for (const migration of this.migrations) {
            if (!appliedMigrations.includes(migration.id)) {
                try {
                    console.log(`[MigrationService] Applying migration: ${migration.name} (ID: ${migration.id})...`);
                    await migration.up(this.database);
                    await this.database.execute(
                        `INSERT INTO ${this.MIGRATIONS_TABLE} (id, name) VALUES (?, ?)`,
                        [migration.id, migration.name]
                    );
                    console.log(`[MigrationService] Migration ${migration.name} applied successfully.`);
                } catch (error) {
                    console.error(`[MigrationService] Failed to apply migration ${migration.name}:`, error);
                    throw error; // Stop on first error
                }
            }
        }
        console.log('[MigrationService] All pending migrations applied.');
    }

    /**
     * Rolls back the last applied migration.
     */
    public async rollbackLastMigration(): Promise<void> {
        await this.init();
        const appliedMigrations = await this.getAppliedMigrations();
        if (appliedMigrations.length === 0) {
            console.log('[MigrationService] No migrations to roll back.');
            return;
        }

        // Get the last applied migration ID
        const lastAppliedId = Math.max(...appliedMigrations);
        const lastMigration = this.migrations.find(m => m.id === lastAppliedId);

        if (lastMigration) {
            try {
                console.log(`[MigrationService] Rolling back migration: ${lastMigration.name} (ID: ${lastMigration.id})...`);
                await lastMigration.down(this.database);
                await this.database.execute(
                    `DELETE FROM ${this.MIGRATIONS_TABLE} WHERE id = ?`,
                    [lastMigration.id]
                );
                console.log(`[MigrationService] Migration ${lastMigration.name} rolled back successfully.`);
            } catch (error) {
                console.error(`[MigrationService] Failed to roll back migration ${lastMigration.name}:`, error);
                throw error;
            }
        } else {
            console.warn(`[MigrationService] Last applied migration (ID: ${lastAppliedId}) not found in available migrations.`);
        }
    }
}
