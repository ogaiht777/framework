
import { IDatabase } from './IDatabase';
import { QueryBuilder } from './QueryBuilder';

/**
 * A mock implementation of the IDatabase interface.
 * This is useful for testing and development without needing a real database connection.
 * It simulates the behavior of a database in memory.
 */
export class MockDatabase implements IDatabase {
    public async connect(): Promise<void> {
        console.log('[MockDatabase] Connecting...');
        console.log('[MockDatabase] Connection successful.');
        return Promise.resolve();
    }

    public async disconnect(): Promise<void> {
        console.log('[MockDatabase] Disconnecting...');
        console.log('[MockDatabase] Disconnection successful.');
        return Promise.resolve();
    }

    public async query<T>(queryOrString: string | { sql: string, params: any[] }, params?: any[]): Promise<T[]> {
        let queryString: string;
        let queryParams: any[];

        if (typeof queryOrString === 'string') {
            queryString = queryOrString;
            queryParams = params || [];
        } else {
            queryString = queryOrString.sql;
            queryParams = queryOrString.params;
        }

        console.log(`[MockDatabase] Executing query: ${queryString} with params:`, queryParams);
        // In a real mock, you might return predefined data based on the query.
        return Promise.resolve([]);
    }

    public async execute(queryOrString: string | { sql: string, params: any[] }, params?: any[]): Promise<number> {
        let queryString: string;
        let queryParams: any[];

        if (typeof queryOrString === 'string') {
            queryString = queryOrString;
            queryParams = params || [];
        } else {
            queryString = queryOrString.sql;
            queryParams = queryOrString.params;
        }

        console.log(`[MockDatabase] Executing statement: ${queryString} with params:`, queryParams);
        // Simulate one row affected.
        return Promise.resolve(1);
    }
}
