
import { IDatabase } from './IDatabase';

/**
 * Defines the contract for a database connection pool.
 * A connection pool manages a set of database connections,
 * allowing for efficient reuse and reducing the overhead of opening/closing connections.
 */
export interface IConnectionPool {
    /**
     * Retrieves a database connection from the pool.
     * @returns A promise that resolves with an IDatabase instance.
     */
    getConnection(): Promise<IDatabase>;

    /**
     * Releases a database connection back to the pool.
     * @param connection The IDatabase instance to release.
     */
    releaseConnection(connection: IDatabase): void;

    /**
     * Closes all connections in the pool and shuts down the pool.
     */
    close(): Promise<void>;
}
