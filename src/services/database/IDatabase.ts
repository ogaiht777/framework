
import { QueryBuilder } from './QueryBuilder';

/**
 * Defines the contract for a database connection.
 * This allows the framework to be agnostic to the underlying database driver (MySQL, PostgreSQL, etc.).
 * Any class that implements this interface can be used as a database provider.
 */
export interface IDatabase {
    /**
     * Establishes a connection to the database.
     */
    connect(): Promise<void>;

    /**
     * Closes the connection to the database.
     */
    disconnect(): Promise<void>;

    /**
     * Executes a query that is expected to return rows.
     * @param queryString The SQL query string.
     * @param params An array of parameters to be safely substituted into the query string.
     * @returns A promise that resolves with an array of results of type T.
     */
    query<T>(queryString: string, params: any[]): Promise<T[]>;
    query<T>(queryBuilder: { sql: string, params: any[] }): Promise<T[]>;

    /**
     * Executes a query that is not expected to return rows (e.g., INSERT, UPDATE, DELETE).
     * @param queryString The SQL query string.
     * @param params An array of parameters to be safely substituted into the query string.
     * @returns A promise that resolves with the number of affected rows.
     */
    execute(queryString: string, params: any[]): Promise<number>;
    execute(queryBuilder: { sql: string, params: any[] }): Promise<number>;
}
